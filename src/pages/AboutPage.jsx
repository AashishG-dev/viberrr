import React from 'react';
import { Radio, Sparkles, Zap, Heart, Keyboard, Globe, Cpu, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import SiteFooter from '../components/SiteFooter';

export default function AboutPage() {
  const { setIsShortcutsOpen, setIsSupportOpen } = useAudio();

  return (
    <div className="w-full min-h-screen bg-[#121316] text-[#e3e2e6] pt-24 pb-36 px-4 sm:px-8">
      <div className="max-w-[1280px] mx-auto flex flex-col">

        {/* Hero Header */}
        <header className="mb-10 pb-8 border-b border-[#343538]/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/60 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
            <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest text-[10px]">
              VIBERR ARCHIVAL BROADCAST CO. // MANIFESTO
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="font-headline-lg text-3xl sm:text-5xl font-serif text-[#FAF8F5] tracking-tight">
              About Viberr
            </h1>
            <p className="font-body-md text-[#c5c7c1] text-xs sm:text-sm mt-3 leading-relaxed">
              Engineered for audiophiles, nocturnal developers, thinkers, and music purists. An autonomous high-fidelity broadcast environment running directly inside the browser with zero computational compression, zero tracking, and pure sonic integrity.
            </p>
          </div>
        </header>

        {/* Tech Architecture Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-[#1b1b1f] border border-[#343538]/50 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d0e11] text-[#cfc6b0] flex items-center justify-center border border-[#343538]/60">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-headline-sm text-lg text-[#FAF8F5]">320kbps Lossless CDN</h3>
            <p className="font-body-sm text-xs text-[#c5c7c1] leading-relaxed">
              Direct edge streaming of uncompressed audio cuts across 28+ handcrafted vaults without algorithmic compression or dynamic ceiling limiting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1b1b1f] border border-[#343538]/50 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d0e11] text-[#cfc6b0] flex items-center justify-center border border-[#343538]/60">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-headline-sm text-lg text-[#FAF8F5]">Real-Time Acoustic Telemetry</h3>
            <p className="font-body-sm text-xs text-[#c5c7c1] leading-relaxed">
              Multi-source acoustic aggregation blending Global Spectral Waves, Neural Airplay Feeds, and Sovereign Lossless Catalogs into an uninterrupted acoustic stream.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1b1b1f] border border-[#343538]/50 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d0e11] text-[#cfc6b0] flex items-center justify-center border border-[#343538]/60">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="font-headline-sm text-lg text-[#FAF8F5]">Tactile Keyboard Control</h3>
            <p className="font-body-sm text-xs text-[#c5c7c1] leading-relaxed">
              Full hardware hotkey navigation: <kbd className="px-1.5 py-0.5 bg-[#292a2d] text-[#FAF8F5] rounded text-[11px] font-mono">Space</kbd> Play, <kbd className="px-1.5 py-0.5 bg-[#292a2d] text-[#FAF8F5] rounded text-[11px] font-mono">S</kbd> Next, <kbd className="px-1.5 py-0.5 bg-[#292a2d] text-[#FAF8F5] rounded text-[11px] font-mono">1-6</kbd> Direct Channels, <kbd className="px-1.5 py-0.5 bg-[#292a2d] text-[#FAF8F5] rounded text-[11px] font-mono">M</kbd> Mute.
            </p>
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="text-xs font-mono text-[#cfc6b0] hover:text-[#FAF8F5] underline cursor-pointer mt-2 block"
            >
              View keyboard shortcut sheet →
            </button>
          </div>
        </div>

        {/* Manifesto Callout */}
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0d0e11] border border-[#343538]/50 shadow-inner text-center max-w-2xl mx-auto">
          <p className="font-serif italic text-lg sm:text-xl text-[#FAF8F5] leading-relaxed">
            "Radio was never meant to be solved by computers. It was meant to be curated by humans with taste."
          </p>
          <span className="font-label-telemetry uppercase text-[10px] text-[#8f918c] tracking-widest mt-4 block">
            VIBERR HI-FI BROADCAST PROTOCOL // EST. 2026
          </span>
        </div>

        {/* Site Footer with Watermark */}
        <SiteFooter />
      </div>
    </div>
  );
}
