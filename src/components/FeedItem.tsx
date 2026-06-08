'use client';

import { formatDistanceToNow } from 'date-fns';
import type { FeedItem as FeedItemType, ItemState } from '@/types/feed';
import SaveButton from './SaveButton';

interface Props {
  item: FeedItemType;
  state: ItemState;
  onSave: () => Promise<void>;
  onDismiss: () => void;
  isSelected?: boolean;
}

export default function FeedItem({ item, state, onSave, onDismiss, isSelected }: Props) {
  const isSaved = state.status === 'saved';
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <div
      className={`group flex items-start gap-3 border-b border-zinc-800/60 py-2.5 px-2 border-l-2 transition-colors ${
        isSelected
          ? 'border-l-blue-500 bg-zinc-900'
          : 'border-l-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm font-medium leading-snug hover:underline ${
            isSaved ? 'text-zinc-500' : 'text-zinc-100 hover:text-white'
          }`}
        >
          {item.title}
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-zinc-400 font-medium">
            {item.feedName}
          </span>
          {timeAgo && (
            <span className="text-[11px] text-zinc-600">{timeAgo}</span>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-0.5 flex-shrink-0 mt-0.5 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <SaveButton status={state.status} onSave={onSave} />
        <button
          onClick={onDismiss}
          title="Dismiss"
          className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
