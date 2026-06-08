export interface FeedItem {
  id: string;
  title: string;
  url: string;
  feedName: string;
  feedUrl: string;
  publishedAt: string;
  summary?: string;
  author?: string;
  tags?: string[];
}

export interface FeedConfig {
  name: string;
  url: string;
  tags?: string[];
}

export interface ItemState {
  status: 'unread' | 'saved' | 'dismissed';
  savedAt?: number;
}

export type StashState = Record<string, ItemState>;

export interface StoryCluster {
  id: string;
  items: FeedItem[];
  representativeTitle: string;
  sources: string[];
}

export interface FeedsResponse {
  items: FeedItem[];
  clusters: StoryCluster[];
  fetchedAt: string;
  errors: { feedName: string; error: string }[];
}

export interface SaveRequest {
  url: string;
  title: string;
  tags?: string[];
}
