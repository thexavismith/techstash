'use client';

interface Props {
  feedNames: string[];
  active: string;
  onChange: (filter: string) => void;
  totalCount: number;
  unreadCount: number;
  unreadPerFeed: Record<string, number>;
}

export default function FeedFilter({
  feedNames,
  active,
  onChange,
  totalCount,
  unreadCount,
  unreadPerFeed,
}: Props) {
  const viewFilter = active === 'unread' || active === 'all' ? active : 'unread';
  const feedFilter = active !== 'unread' && active !== 'all' ? active : '';

  function handleViewToggle(view: 'unread' | 'all') {
    onChange(view);
  }

  function handleFeedSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === '') {
      onChange(viewFilter);
    } else {
      onChange(val);
    }
  }

  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleViewToggle('unread')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            viewFilter === 'unread' && !feedFilter
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => handleViewToggle('all')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            viewFilter === 'all' && !feedFilter
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          All ({totalCount})
        </button>
      </div>
      <select
        value={feedFilter}
        onChange={handleFeedSelect}
        className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 hover:border-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors max-w-[180px]"
      >
        <option value="">All feeds</option>
        {feedNames.map((name) => (
          <option key={name} value={name}>
            {name} ({unreadPerFeed[name] ?? 0})
          </option>
        ))}
      </select>
    </div>
  );
}
