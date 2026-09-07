import React from 'react';
import { Keyboard } from 'lucide-react';

function TactileShortcutsBar({ onOpenShortcuts }) {
  return (
    <section className="hidden sm:block py-6 border-b border-[#2b2f33]/60 relative" id="shortcuts-bar">
      <div className="p-3 sm:p-4 rounded-[12px] bg-[#121316] border border-[#cfc6b0]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono relative">
        <span className="cad-corner cad-tl" />
        <span className="cad-corner cad-br" />

        <div className="flex items-center gap-3">
          <Keyboard className="w-4 h-4 text-[#cfc6b0]" />
          <span className="text-[#FAF8F5] tracking-[0.14em] uppercase font-semibold">TACTILE COMMAND BUS:</span>
          <span className="text-[#8f918c] hidden sm:inline text-[11px]">Hardware key routing with direct audio focus</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[#8f918c] text-[10px]">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded-[4px] bg-[#1b1b1f] text-[#FAF8F5] font-mono border border-[#2b2f33]">
              SPACE
            </kbd>
            <span>PLAY/PAUSE</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded-[4px] bg-[#1b1b1f] text-[#FAF8F5] font-mono border border-[#2b2f33]">
              S
            </kbd>
            <span>HOP</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded-[4px] bg-[#1b1b1f] text-[#FAF8F5] font-mono border border-[#2b2f33]">
              M
            </kbd>
            <span>MUTE</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded-[4px] bg-[#1b1b1f] text-[#FAF8F5] font-mono border border-[#2b2f33]">
              1-6
            </kbd>
            <span>CHANNEL</span>
          </span>

          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded-[4px] bg-[#1b1b1f] text-[#FAF8F5] font-mono border border-[#2b2f33]">
              ⌘K
            </kbd>
            <span>SEARCH</span>
          </span>

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="text-[#cfc6b0] hover:text-[#FAF8F5] cursor-pointer ml-1 font-mono uppercase"
            >
              [ALL ?]
            </button>
          )}
        </div>

      </div>
    </section>
  );
}

export default React.memo(TactileShortcutsBar);


