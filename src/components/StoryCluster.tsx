'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { StoryCluster, ItemState, StashState } from '@/types/feed';
import SaveButton from './SaveButton';

interface Props {
  cluster: StoryCluster;
  stashState: StashState;
  onSave: (item: StoryCluster['items'][number]) => Promise<void>;
  onDismiss: (id: string) => void;
  isSelected?: boolean;
}

export default function StoryClusterRow({ cluster, stashState, onSave, onDismiss, isSelected }: Props) {
  const [expanded, setExpanded] = useState(false);

  const lead = cluster.items[0];
  const leadState: ItemState = stashState[lead.id] ?? { status: 'unread' };
  const isSaved = leadState.status === 'saved';

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(lead.publishedAt), { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <div
      className={`border-b border-zinc-800/60 py-2.5 px-2 border-l-2 transition-colors ${
        isSelected ? 'border-l-blue-500 bg-zinc-900' : 'border-l-amber-600'
      }`}
    >
      <div className="group flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium leading-snug hover:underline ${
              isSaved ? 'text-zinc-500' : 'text-zinc-100 hover:text-white'
            }`}
          >
            {cluster.representativeTitle}
          </a>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded hover:bg-amber-900 transition-colors"
            >
              {cluster.sources.length} {cluster.sources.length === 1 ? 'source' : 'sources'}
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <span className="text-[11px] text-zinc-400 font-medium">
              {lead.feedName}
            </span>
            {timeAgo && (
              <span className="text-[11px] text-zinc-600">{timeAgo}</span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-0.5 flex-shrink-0 mt-0.5 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <SaveButton status={leadState.status} onSave={() => onSave(lead)} />
          <button
            onClick={() => onDismiss(lead.id)}
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

      {expanded && (
        <div className="mt-2 ml-1 pl-3 border-l border-zinc-800 space-y-2">
          {cluster.items.map((item) => {
            const itemState: ItemState = stashState[item.id] ?? { status: 'unread' };
            const itemTimeAgo = (() => {
              try {
                return formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });
              } catch {
                return '';
              }
            })();
            return (
              <div key={item.id} className="group flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs leading-snug hover:underline ${
                      itemState.status === 'saved' ? 'text-zinc-600' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {item.title}
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {item.feedName}
                    </span>
                    {itemTimeAgo && (
                      <span className="text-[11px] text-zinc-600">{itemTimeAgo}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                  <SaveButton status={itemState.status} onSave={() => onSave(item)} />
                  <button
                    onClick={() => onDismiss(item.id)}
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
          })}
        </div>
      )}
    </div>
  );
}
