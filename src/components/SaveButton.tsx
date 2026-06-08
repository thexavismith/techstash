'use client';

import { useState } from 'react';

type SaveState = 'idle' | 'loading' | 'saved' | 'error';

interface Props {
  status: 'unread' | 'saved' | 'dismissed';
  onSave: () => Promise<void>;
}

export default function SaveButton({ status, onSave }: Props) {
  const [saveState, setSaveState] = useState<SaveState>(
    status === 'saved' ? 'saved' : 'idle'
  );

  if (saveState === 'saved' || status === 'saved') {
    return (
      <button
        disabled
        title="Saved to Reader"
        className="p-1 text-green-400 cursor-default"
        aria-label="Saved"
      >
        <BookmarkFilledIcon />
      </button>
    );
  }

  async function handleClick() {
    setSaveState('loading');
    try {
      await onSave();
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }

  if (saveState === 'loading') {
    return (
      <button disabled className="p-1 text-zinc-400 cursor-wait" aria-label="Saving…">
        <SpinnerIcon />
      </button>
    );
  }

  if (saveState === 'error') {
    return (
      <button
        onClick={handleClick}
        title="Failed — click to retry"
        className="p-1 text-red-400 hover:text-red-300"
        aria-label="Save failed, click to retry"
      >
        <BookmarkIcon />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      title="Save to Reader"
      className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
      aria-label="Save to Reader"
    >
      <BookmarkIcon />
    </button>
  );
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkFilledIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
