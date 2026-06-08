import type { ItemState, StashState } from '@/types/feed';

const STORAGE_KEY = 'techstash-state';

export function getStashState(): StashState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StashState) : {};
  } catch {
    return {};
  }
}

export function getItemState(id: string): ItemState {
  return getStashState()[id] ?? { status: 'unread' };
}

export function setItemState(id: string, state: ItemState): void {
  if (typeof window === 'undefined') return;
  const current = getStashState();
  current[id] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function clearDismissedBefore(days: number): void {
  if (typeof window === 'undefined') return;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const state = getStashState();
  let changed = false;
  for (const [id, item] of Object.entries(state)) {
    if (item.status === 'dismissed' && item.savedAt && item.savedAt < cutoff) {
      delete state[id];
      changed = true;
    }
  }
  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
