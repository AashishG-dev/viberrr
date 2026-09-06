import React from 'react';
import { Keyboard } from 'lucide-react';

export default function TactileShortcutsBar({ onOpenShortcuts }) {
  return (
    <section className="py-6 border-b border-[#343538]/40" id="shortcuts-bar">
      <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#343538]/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono shadow-sm">
        
        <div className="flex items-center gap-2.5">
          <Keyboard className="w-4 h-4 text-[#cfc6b0]" />
          <span className="text-[#FAF8F5] font-bold">TACTILE SHORTCUTS:</span>
          <span className="text-[#8f918c] hidden sm:inline">Navigate seamlessly without losing audio focus</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[#8f918c] text-[11px]">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-[#343538] text-[#FAF8F5] font-mono font-bold border border-white/5">
              SPACE
            </kbd>
            <span>PLAY/PAUSE</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-[#343538] text-[#FAF8F5] font-mono font-bold border border-white/5">
              S
            </kbd>
            <span>HOP STATION</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-[#343538] text-[#FAF8F5] font-mono font-bold border border-white/5">
              M
            </kbd>
            <span>MUTE</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-[#343538] text-[#FAF8F5] font-mono font-bold border border-white/5">
              1-6
            </kbd>
            <span>CHANNEL DIRECT</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-[#343538] text-[#FAF8F5] font-mono font-bold border border-white/5">
              ⌘K
            </kbd>
            <span>SEARCH</span>
          </span>

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="text-[#cfc6b0] hover:underline cursor-pointer ml-1"
            >
              [ALL ?]
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
