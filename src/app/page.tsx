import { fetchAllFeeds } from '@/lib/rss';
import FeedGrid from '@/components/FeedGrid';
import FeedHeader from '@/components/FeedHeader';

export default async function Home() {
  const { items, clusters, fetchedAt, errors } = await fetchAllFeeds();

  return (
    <main>
      <FeedHeader fetchedAt={fetchedAt} />
      {errors.length > 0 && (
        <div className="mt-3 text-xs text-zinc-600">
          Failed to load: {errors.map((e) => e.feedName).join(', ')}
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <details className="my-3 text-xs text-zinc-500 border border-zinc-800 rounded p-2">
          <summary className="cursor-pointer font-medium">
            Cluster debug — {clusters.length} cluster{clusters.length !== 1 ? 's' : ''} from {items.length} items today
          </summary>
          <div className="mt-2 space-y-2">
            {clusters.length === 0 ? (
              <div className="space-y-1">
                <p className="text-zinc-600">No clusters found. Either no stories overlap yet today, or the token threshold (2 shared words) is too strict.</p>
                <p className="text-zinc-700 font-medium mt-2">All titles today:</p>
                {items.map((item) => (
                  <p key={item.id} className="text-zinc-700">{item.feedName}: &ldquo;{item.title}&rdquo;</p>
                ))}
              </div>
            ) : (
              clusters.map((c) => (
                <div key={c.id} className="border-t border-zinc-800 pt-2">
                  <p className="text-zinc-400 font-medium">{c.sources.length} sources: {c.sources.join(', ')}</p>
                  <ul className="mt-1 space-y-0.5 pl-2">
                    {c.items.map((item) => (
                      <li key={item.id} className="text-zinc-600">&ldquo;{item.title}&rdquo; — {item.feedName}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </details>
      )}
      <FeedGrid items={items} clusters={clusters} />
    </main>
  );
}
