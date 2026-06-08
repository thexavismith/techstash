'use client';

import { useState } from 'react';

const shortcuts = [
  { key: 'j / ↓', desc: 'Next item' },
  { key: 'k / ↑', desc: 'Previous item' },
  { key: 's', desc: 'Save to Reader' },
  { key: 'd', desc: 'Dismiss' },
  { key: 'o / Enter', desc: 'Open link' },
];

export default function KeyboardHint() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-5 h-5 rounded-full border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors text-[11px] font-medium flex items-center justify-center"
        aria-label="Keyboard shortcuts"
      >
        ?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-zinc-900 border border-zinc-700 rounded-lg p-3 w-44 shadow-xl">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-2">Shortcuts</p>
            <div className="space-y-1.5">
              {shortcuts.map(({ key, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <kbd className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                    {key}
                  </kbd>
                  <span className="text-[11px] text-zinc-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
