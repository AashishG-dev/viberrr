import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause current track' },
    { key: 'S', desc: 'Toggle Shuffle Mode' },
    { key: 'A', desc: 'Open Ambient FX & Weather Shaders' },
    { key: 'Z', desc: 'Toggle Zen Minimal Island Mode' },
    { key: 'X', desc: 'Always-On-Top Floating Player (PiP)' },
    { key: 'N', desc: 'Skip to Next track' },
    { key: 'P', desc: 'Previous track (or restart)' },
    { key: 'M', desc: 'Mute / Unmute audio volume' },
    { key: 'F', desc: 'Toggle Fullscreen Screensaver' },
    { key: '← / →', desc: 'Previous / Next background scene' },
    { key: '?', desc: 'Toggle this Shortcuts Guide' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl pointer-events-auto transition-all"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-3xl glass-panel-neon border border-white/20 shadow-2xl p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-syne text-white">Keyboard Hotkeys</h3>
                <p className="text-xs font-mono text-white/50">[ SEAMLESS TERMINAL CONTROLS ]</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="glass-button p-2 rounded-full text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="mt-4 space-y-2.5">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              >
                <span className="text-xs sm:text-sm text-neutral-300 font-space font-medium">
                  {sc.desc}
                </span>
                <kbd className="px-3 py-1 bg-white/15 border border-white/25 rounded-xl text-xs font-mono font-bold text-cyan-300 shadow-sm">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] font-mono text-white/40">
              [ Tip: Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd> anytime to dismiss ]
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
