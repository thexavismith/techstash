import Parser from 'rss-parser';
import { unstable_cache } from 'next/cache';
import { feeds } from '../../feeds.config';
import type { FeedItem, FeedsResponse, StoryCluster } from '@/types/feed';

const parser = new Parser({ timeout: 10000 });

function makeId(feedUrl: string, itemUrl: string): string {
  return Buffer.from(encodeURIComponent(feedUrl + itemUrl)).toString('base64');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'will',
  'been', 'are', 'was', 'were', 'has', 'its', 'not', 'but', 'what',
  'all', 'can', 'her', 'his', 'how', 'into', 'more', 'about', 'over',
  'after', 'new', 'says', 'said', 'your', 'they', 'their', 'than',
  'just', 'also', 'when', 'out', 'now', 'get', 'why', 'here',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function bigrams(words: string[]): Set<string> {
  const result = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    result.add(`${words[i]}|${words[i + 1]}`);
  }
  return result;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

function overlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const w of a) if (b.has(w)) count++;
  return count;
}

function clusterTodaysItems(items: FeedItem[]): StoryCluster[] {
  const titleTokenCache = new Map<string, Set<string>>();
  const descBigramCache = new Map<string, Set<string>>();
  for (const item of items) {
    const titleWords = tokenize(item.title);
    titleTokenCache.set(item.id, new Set(titleWords));
    const descWords = tokenize(item.summary ?? '');
    descBigramCache.set(item.id, bigrams([...titleWords, ...descWords]));
  }

  // union-find to group overlapping items
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)!));
    return parent.get(id)!;
  };
  const union = (a: string, b: string) => {
    parent.set(find(a), find(b));
  };

  for (const item of items) parent.set(item.id, item.id);

  const pairScores: { a: string; b: string; titleOverlap: number; descSimilarity: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const titleOverlap = overlap(titleTokenCache.get(a.id)!, titleTokenCache.get(b.id)!);
      const descSimilarity = jaccardSimilarity(descBigramCache.get(a.id)!, descBigramCache.get(b.id)!);
      if (process.env.NODE_ENV === 'development' && (titleOverlap >= 1 || descSimilarity >= 0.05)) {
        pairScores.push({ a: a.title, b: b.title, titleOverlap, descSimilarity } as never);
      }
      if (titleOverlap >= 2 || descSimilarity >= 0.05) {
        union(a.id, b.id);
      }
    }
  }

  const groups = new Map<string, FeedItem[]>();
  for (const item of items) {
    const root = find(item.id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(item);
  }

  const clusters: StoryCluster[] = [];
  for (const [, groupItems] of groups) {
    if (groupItems.length < 2) continue;
    groupItems.sort(
      (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
    const lead = groupItems[0];
    clusters.push({
      id: `cluster-${lead.id}`,
      items: groupItems,
      representativeTitle: lead.title,
      sources: [...new Set(groupItems.map((i) => i.feedName))],
    });
  }

  // most-covered stories first
  clusters.sort((a, b) => b.items.length - a.items.length);

  if (process.env.NODE_ENV === 'development') {
    const top = (pairScores as { a: string; b: string; titleOverlap: number; descSimilarity: number }[])
      .sort((x, y) => y.descSimilarity - x.descSimilarity)
      .slice(0, 10);
    console.log('[clustering] top pairs by desc similarity:');
    for (const p of top) {
      console.log(`  title_overlap=${p.titleOverlap} desc_sim=${p.descSimilarity.toFixed(3)}\n    "${p.a}"\n    "${p.b}"`);
    }
  }

  return clusters;
}

async function _fetchAllFeeds(): Promise<FeedsResponse> {
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.map((item): FeedItem => ({
        id: makeId(feed.url, item.link ?? item.guid ?? ''),
        title: item.title ?? '(untitled)',
        url: item.link ?? '',
        feedName: feed.name,
        feedUrl: feed.url,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        summary: item.contentSnippet
          ? item.contentSnippet.slice(0, 200)
          : item.content
          ? stripHtml(item.content).slice(0, 200)
          : undefined,
        author: item.creator ?? item.author ?? undefined,
        tags: feed.tags,
      }));
    })
  );

  const items: FeedItem[] = [];
  const errors: { feedName: string; error: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    } else {
      errors.push({
        feedName: feeds[i].name,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }
  });

  items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayItems = items.filter((item) => new Date(item.publishedAt) >= todayStart);

  const clusters = clusterTodaysItems(todayItems);

  return { items: todayItems, clusters, fetchedAt: new Date().toISOString(), errors };
}

export const fetchAllFeeds = unstable_cache(
  _fetchAllFeeds,
  ['all-feeds-v5'],
  { revalidate: 300 }
);
