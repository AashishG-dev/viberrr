import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, Sparkles, Sliders, ShieldAlert, Radio, 
  Volume2, ArrowRight, Play, CheckCircle2
} from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, onStartPlayback }) {
  if (!isOpen) return null;

  const handleStart = () => {
    try {
      localStorage.setItem('viberr_onboarded', 'true');
    } catch (e) {}
    onClose();
    if (onStartPlayback) onStartPlayback();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl pointer-events-auto"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-3xl glass-panel-neon border border-white/20 shadow-2xl p-5 sm:p-7 overflow-hidden flex flex-col relative bg-black/90 text-white"
        >
          {/* Top Brand & Neon Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)] flex-shrink-0">
                <Headphones className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-syne tracking-tight text-white flex items-center gap-2">
                  <span>WELCOME TO VIBERR</span>
                </h2>
                <p className="text-xs font-mono text-cyan-300/80">
                  [ 24/7 AESTHETIC HI-FI LIVE RADIO ]
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/70 border border-white/15">
              v1.0 LIVE
            </span>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-4 space-y-2.5 sm:space-y-3">
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-syne text-white">28+ Lossless Curated Stations</h3>
                <p className="text-[11px] sm:text-xs text-white/60 font-space mt-0.5 leading-relaxed">
                  Desi Hip Hop, Drift Phonk, Retro Bollywood, Lo-Fi, and 24/7 global web streams with zero subscription walls.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-400/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-syne text-white">10-Band Studio Equalizer & Audio Shaders</h3>
                <p className="text-[11px] sm:text-xs text-white/60 font-space mt-0.5 leading-relaxed">
                  Real-time DSP EQ presets, procedural rain soundscapes, vinyl crackle, and 432Hz binaural focus beats.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-syne text-white">Floating PiP Mini Player & Keyboard Controls</h3>
                <p className="text-[11px] sm:text-xs text-white/60 font-space mt-0.5 leading-relaxed">
                  Multitask with always-on-top window. Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">Space</kbd> to play, <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">N</kbd> for next, <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">F</kbd> for screensaver.
                </p>
              </div>
            </div>
          </div>

          {/* 18+ Content & Sponsored Ads Notice */}
          <div className="mt-4 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-[11px] font-space text-amber-200/90 leading-tight">
              <strong className="text-amber-300 font-bold uppercase">Notice / 18+ Content:</strong> This platform is supported by non-intrusive 3rd-party sponsored ads and links. Viewer discretion is advised for sponsored placements.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-5 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black text-sm font-black font-syne tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <span>START VIBING & TUNE IN</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
