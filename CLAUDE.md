# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: This is Next.js 16

This project runs Next.js 16.2.7, which has breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before making changes. Key differences:

- **Caching**: The default caching model changed. `fetch` requests are **not** cached by default. `export const revalidate = N` (route segment config) is the previous model — for non-fetch async functions (like `rss-parser`), use `unstable_cache` from `next/cache`. The new model uses `'use cache'` directive + `cacheLife()`, enabled via `cacheComponents: true` in `next.config.ts`.
- Currently this project does **not** use `cacheComponents: true`, so `unstable_cache` is the correct caching primitive for `fetchAllFeeds()`.

## Commands

```bash
npm run dev       # start dev server (http://localhost:3000)
npm run build     # production build
npm run lint      # ESLint
npx tsc --noEmit  # type check without building
```

No test suite is configured.

## Architecture

**Data flow**: `feeds.config.ts` → `src/lib/rss.ts` → `src/app/page.tsx` (RSC) → `src/components/FeedGrid.tsx` (client boundary) → `src/components/FeedItem.tsx`

**Key files:**
- `feeds.config.ts` — the only user-editable config; defines RSS feed URLs, display names, and Readwise tags
- `src/lib/rss.ts` — fetches all feeds in parallel with `Promise.allSettled` (partial failures don't break the page), normalizes to `FeedItem`, generates stable IDs via `btoa(encodeURIComponent(feedUrl + itemUrl))`
- `src/lib/readwise.ts` — server-only Readwise Reader API client; reads `READWISE_API_KEY` from env
- `src/lib/storage.ts` — client-only localStorage helpers; all functions guard against SSR with `typeof window`
- `src/app/api/save/route.ts` — POST route that proxies to Readwise; keeps API key server-side
- `src/components/FeedGrid.tsx` — `'use client'` orchestrator; owns all interactive state, localStorage sync, save/dismiss handlers
- `src/types/feed.ts` — all shared TypeScript types

**Server/client split**: `page.tsx` is an async RSC that calls `fetchAllFeeds()` directly (no HTTP round-trip). `FeedGrid` is the client boundary — it receives `FeedItem[]` as props but owns `StashState` (read/saved/dismissed per item). Hydration mismatch is avoided by initializing `stashState` as `{}` on first render and populating from localStorage in `useEffect`.

**State persistence**: Item states (`unread` | `saved` | `dismissed`) are stored in localStorage under key `techstash-state` as `Record<itemId, ItemState>`. `clearDismissedBefore(30)` prunes entries older than 30 days on mount.

**Environment**: Requires `READWISE_API_KEY` in `.env.local`. Get your key from `https://readwise.io/access_token`.
