import KeyboardHint from './KeyboardHint';

interface Props {
  fetchedAt: string;
}

export default function FeedHeader({ fetchedAt }: Props) {
  const fetched = (() => {
    try {
      return new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  })();

  return (
    <header className="flex items-center justify-between py-4 border-b border-zinc-800">
      <h1 className="text-sm font-mono font-semibold tracking-[0.15em] text-zinc-200">
        techstash
      </h1>
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        {fetched && <span className="text-zinc-600">{fetched}</span>}
        <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          refresh
        </a>
        <KeyboardHint />
      </div>
    </header>
  );
}
