'use client';

import { useEffect, useRef, useState } from 'react';
import type { FeedItem, StashState, StoryCluster } from '@/types/feed';
import { getStashState, setItemState, clearDismissedBefore } from '@/lib/storage';
import FeedItemRow from './FeedItem';
import FeedFilter from './FeedFilter';
import StoryClusterRow from './StoryCluster';

interface Props {
  items: FeedItem[];
  clusters: StoryCluster[];
}

type NavItem =
  | { type: 'cluster'; cluster: StoryCluster; index: number }
  | { type: 'item'; item: FeedItem; index: number };

export default function FeedGrid({ items, clusters }: Props) {
  const [stashState, setStashState] = useState<StashState>({});
  const [filter, setFilter] = useState('unread');
  const [hydrated, setHydrated] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    clearDismissedBefore(30);
    setStashState(getStashState());
    setHydrated(true);
  }, []);

  const feedNames = [...new Set(items.map((i) => i.feedName))].sort();

  const clusteredIds = new Set(clusters.flatMap((c) => c.items.map((i) => i.id)));

  const visibleClusters = filter === 'unread' || filter === 'all' ? clusters : [];

  const visibleItems = items.filter((item) => {
    const state = stashState[item.id]?.status ?? 'unread';
    if (filter === 'unread') return state === 'unread' && !clusteredIds.has(item.id);
    if (filter === 'all') return !clusteredIds.has(item.id);
    return item.feedName === filter && state !== 'dismissed';
  });

  const navItems: NavItem[] = [
    ...visibleClusters.map((cluster, i) => ({ type: 'cluster' as const, cluster, index: i })),
    ...visibleItems.map((item, i) => ({ type: 'item' as const, item, index: visibleClusters.length + i })),
  ];

  const totalVisible = navItems.length;

  const unreadCount = items.filter(
    (item) => !clusteredIds.has(item.id) && (stashState[item.id]?.status ?? 'unread') === 'unread'
  ).length;

  const unreadPerFeed: Record<string, number> = {};
  for (const item of items) {
    if (!clusteredIds.has(item.id) && (stashState[item.id]?.status ?? 'unread') === 'unread') {
      unreadPerFeed[item.feedName] = (unreadPerFeed[item.feedName] ?? 0) + 1;
    }
  }

  const totalUnread = unreadCount;

  async function handleSave(item: FeedItem) {
    const tags = item.tags;
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url, title: item.title, tags }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error ?? 'Save failed');
    const next = { ...stashState, [item.id]: { status: 'saved' as const, savedAt: Date.now() } };
    setStashState(next);
    setItemState(item.id, { status: 'saved', savedAt: Date.now() });
  }

  function handleDismiss(id: string) {
    const next = { ...stashState, [id]: { status: 'dismissed' as const, savedAt: Date.now() } };
    setStashState(next);
    setItemState(id, { status: 'dismissed', savedAt: Date.now() });
  }

  useEffect(() => {
    if (!hydrated) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return Math.min(prev + 1, totalVisible - 1);
        });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return Math.max(prev - 1, 0);
        });
      } else if (e.key === 's') {
        if (selectedIndex === null) return;
        const nav = navItems[selectedIndex];
        if (!nav) return;
        if (nav.type === 'item') handleSave(nav.item);
        else if (nav.type === 'cluster') handleSave(nav.cluster.items[0]);
      } else if (e.key === 'd') {
        if (selectedIndex === null) return;
        const nav = navItems[selectedIndex];
        if (!nav) return;
        if (nav.type === 'item') handleDismiss(nav.item.id);
        else if (nav.type === 'cluster') handleDismiss(nav.cluster.items[0].id);
      } else if (e.key === 'o' || e.key === 'Enter') {
        if (selectedIndex === null) return;
        const nav = navItems[selectedIndex];
        if (!nav) return;
        const url = nav.type === 'item' ? nav.item.url : nav.cluster.items[0].url;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hydrated, selectedIndex, navItems, totalVisible]);

  useEffect(() => {
    if (selectedIndex !== null && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!hydrated) {
    return <div className="py-8 text-center text-zinc-600 text-sm">Loading…</div>;
  }

  return (
    <div>
      <FeedFilter
        feedNames={feedNames}
        active={filter}
        onChange={(f) => { setFilter(f); setSelectedIndex(null); }}
        totalCount={items.length}
        unreadCount={unreadCount}
        unreadPerFeed={unreadPerFeed}
      />

      {filter === 'unread' && totalVisible > 0 && (
        <div className="flex items-center gap-3 pb-3">
          <div className="flex-1 h-px bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-600 rounded-full transition-all"
              style={{ width: `${Math.max(4, (1 - totalVisible / Math.max(totalUnread, totalVisible)) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-600 shrink-0">{totalVisible} unread</span>
        </div>
      )}

      {visibleClusters.length === 0 && visibleItems.length === 0 ? (
        <div className="py-12 text-center text-zinc-600 text-sm">
          {filter === 'unread' ? 'All caught up.' : 'Nothing here.'}
        </div>
      ) : (
        <div>
          {visibleClusters.length > 0 && (
            <>
              <div className="px-1 py-1.5 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                Trending
              </div>
              {visibleClusters.map((cluster, i) => (
                <div
                  key={cluster.id}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  onClick={() => setSelectedIndex(i)}
                >
                  <StoryClusterRow
                    cluster={cluster}
                    stashState={stashState}
                    onSave={handleSave}
                    onDismiss={handleDismiss}
                    isSelected={selectedIndex === i}
                  />
                </div>
              ))}
              {visibleItems.length > 0 && (
                <div className="px-1 py-1.5 text-[10px] text-zinc-600 uppercase tracking-widest font-medium mt-2">
                  Latest
                </div>
              )}
            </>
          )}
          {visibleItems.map((item, i) => {
            const navIdx = visibleClusters.length + i;
            return (
              <div
                key={item.id}
                ref={(el) => { itemRefs.current[navIdx] = el; }}
                onClick={() => setSelectedIndex(navIdx)}
              >
                <FeedItemRow
                  item={item}
                  state={stashState[item.id] ?? { status: 'unread' }}
                  onSave={() => handleSave(item)}
                  onDismiss={() => handleDismiss(item.id)}
                  isSelected={selectedIndex === navIdx}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
