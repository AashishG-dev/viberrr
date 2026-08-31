import React from 'react';
import { motion } from 'framer-motion';
import { Radio, ShieldAlert, Sparkles, Zap, Heart, Keyboard, Globe, Cpu, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function AboutPage() {
  const { setIsShortcutsOpen, setIsSupportOpen } = useAudio();

  return (
    <div className="w-full flex-1 overflow-y-auto px-3 sm:px-8 py-6 pb-28 custom-scroll max-w-[1720px] mx-auto text-white">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden glass-panel-neon border border-white/20 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-black/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-mono mb-3">
            <Radio className="w-3.5 h-3.5" />
            <span>THE NEXT-GEN LOSSLESS MUSIC PLATFORM</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-syne text-white tracking-tight leading-tight">
            About Viberr
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-space mt-2 leading-relaxed">
            Engineered for audiophiles, late-night coders, thinkers, and music lovers. An aesthetic, high-fidelity live music universe built with zero latency and high visual craft.
          </p>
        </div>
      </div>

      {/* Tech Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-syne text-white">320kbps Lossless CDN</h3>
          <p className="text-xs text-white/60 font-space leading-relaxed">
            Delivers studio master uncompressed audio streams across 28+ handcrafted stations without dynamic range compression or buffering.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-syne text-white">Nuclear-Style Hybrid Engine</h3>
          <p className="text-xs text-white/60 font-space leading-relaxed">
            Integrates Spotify 100M+ catalog discovery with headless zero-CORS audio resolution for 100% full-length playback.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Keyboard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-syne text-white">Keyboard Hotkeys</h3>
          <p className="text-xs text-white/60 font-space leading-relaxed">
            Full keyboard control: <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Space</kbd> Play/Pause, <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Ctrl+K</kbd> Search, <kbd className="px-1.5 py-0.5 bg-white/10 rounded">M</kbd> Mute, <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Z</kbd> Zen Minimal Mode.
          </p>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="text-xs font-mono text-purple-300 hover:text-white underline cursor-pointer mt-2 block"
          >
            View all shortcuts →
          </button>
        </div>
      </div>

      {/* 18+ Content & Sponsored Content Notice */}
      <div className="rounded-3xl p-6 sm:p-8 border border-amber-400/30 bg-amber-500/[0.04] mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-syne text-amber-200">
              18+ Disclaimer & Sponsored Ads Notice
            </h3>
            <p className="text-xs text-white/60 font-space mt-1 leading-relaxed">
              Viberr features raw artistic hip hop discographies (including uncensored MTV Hustle, Desi Hip Hop, drill, and underground rap) which may contain explicit lyrics. Additionally, sponsored banners and advertising placements help keep Viberr 100% free and independent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
