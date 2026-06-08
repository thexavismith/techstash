import type { FeedConfig } from '@/types/feed';

export const feeds: FeedConfig[] = [
  // Tech
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/', tags: ['apple', 'tech'] },
  { name: 'The Verge', url: 'http://theverge.com/rss/index.xml', tags: ['tech'] },
  { name: 'MacStories', url: 'https://www.macstories.net/feed/', tags: ['apple', 'tech'] },
  { name: 'Daring Fireball', url: 'https://daringfireball.net/feeds/main', tags: ['apple', 'tech'] },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage?points=200', tags: ['hn', 'tech'] },
  { name: 'Birchtree', url: 'https://birchtree.me/rss/', tags: ['tech'] },
  { name: 'Six Colors', url: 'https://sixcolors.com/feed/', tags: ['apple', 'tech'] },
  { name: 'Faraway, So Close', url: 'https://chrisenns.com/feed.xml', tags: ['tech'] },
  { name: 'MacSparky', url: 'https://www.macsparky.com/feed/', tags: ['apple', 'tech'] },

  // Tech Tier 2
  { name: '404 Media', url: 'https://www.404media.co/rss', tags: ['tech'] },
  { name: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index', tags: ['tech'] },
  { name: 'EFF Deeplinks', url: 'https://www.eff.org/rss/updates.xml', tags: ['tech'] },
  { name: 'Defector', url: 'https://defector.com/feed', tags: ['tech'] },
  { name: 'Pluralistic', url: 'https://pluralistic.net/feed/', tags: ['tech'] },
  { name: 'Platformer', url: 'https://www.platformer.news/feed', tags: ['tech'] },
  { name: 'Maggie Appleton', url: 'https://maggieappleton.com/rss.xml', tags: ['tech'] },
  { name: 'Obsidian Changelog', url: 'https://obsidian.md/changelog.xml', tags: ['tech'] },
  { name: 'Obsidian Blog', url: 'https://obsidian.md/feed.xml', tags: ['tech'] },

  // Misc
  { name: 'Garbage Day', url: 'https://rss.beehiiv.com/feeds/owMwaGYU36.xml', tags: [] },
  { name: 'Sad Writer Digest', url: 'https://sadwriterdigest.substack.com/feed', tags: [] },
  { name: "Zaftig's Pink", url: 'https://zaftigpink.substack.com/feed', tags: [] },
  { name: 'Bonnie Jean Castillo', url: 'https://frathousefeelings.substack.com/feed', tags: [] },
  { name: 'Matthew Puddister', url: 'https://matthewpuddister.substack.com/feed', tags: [] },

  // Politics
  { name: 'Revolutionary Communists of America', url: 'https://communistusa.org/feed/', tags: ['politics'] },
];
