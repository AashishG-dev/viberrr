import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K / /', desc: 'Universal Global Search (Tracks & Airplay Relays)' },
    { key: 'Space', desc: 'Play / Pause current acoustic feed' },
    { key: 'S', desc: 'Toggle Frequency Shuffle Mode' },
    { key: 'A', desc: 'Open Acoustic Matrix & Room Reverb' },
    { key: 'Z', desc: 'Toggle Zen Observatory Mode' },
    { key: 'X', desc: 'Always-On-Top Floating Player (PiP)' },
    { key: 'N', desc: 'Skip to Next master track' },
    { key: 'P', desc: 'Previous master track' },
    { key: 'M', desc: 'Mute / Unmute audio telemetry' },
    { key: 'F', desc: 'Toggle Fullscreen Screensaver' },
    { key: '← / →', desc: 'Previous / Next visual scene' },
    { key: '?', desc: 'Toggle this Shortcuts Guide' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0e11]/85 backdrop-blur-md pointer-events-auto transition-all"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#121316] border border-[#cfc6b0]/35 shadow-2xl p-6 overflow-hidden relative text-[#FAF8F5] pointer-events-auto z-50 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Crosshairs */}
            <span className="cad-corner cad-tl" />
            <span className="cad-corner cad-tr" />
            <span className="cad-corner cad-bl" />
            <span className="cad-corner cad-br" />

            <div className="flex items-center justify-between pb-4 border-b border-[#cfc6b0]/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#cfc6b0]/30 flex items-center justify-center text-[#cfc6b0] bg-[#18191d]">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-[#FAF8F5] uppercase tracking-wider">Tactile Telemetry Hotkeys</h3>
                <p className="text-[10px] font-mono text-[#FAF8F5]/40">[ HARDWARE PROTOCOL CONTROLS ]</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 border border-[#cfc6b0]/30 text-[#FAF8F5]/70 hover:text-[#121316] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scroll pr-1">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 bg-[#18191d]/80 border border-[#cfc6b0]/15 hover:border-[#cfc6b0]/40 transition-colors"
              >
                <span className="text-xs text-[#FAF8F5]/80 font-mono">
                  {sc.desc}
                </span>
                <kbd className="px-2 py-0.5 bg-[#232529] border border-[#cfc6b0]/30 text-[10px] font-mono font-bold text-[#cfc6b0]">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#cfc6b0]/15 text-center">
            <p className="text-[10px] font-mono text-[#FAF8F5]/40">
              [ PRESS <kbd className="px-1.5 py-0.5 bg-[#18191d] border border-[#cfc6b0]/30 text-[#FAF8F5]">ESC</kbd> TO DISMISS ]
            </p>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
