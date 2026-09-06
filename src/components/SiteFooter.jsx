import React from 'react';
import { Heart } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="w-full bg-[#0d0e11] rounded-2xl mt-12 p-6 sm:p-8 border border-[#343538]/40 shadow-inner">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[#8f918c]">
        {/* Brand identity */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="font-headline-sm text-sm text-[#FAF8F5] font-bold tracking-tight">VIBERR</span>
          <span className="font-label-telemetry uppercase text-[11px] hidden sm:inline">
            — AUDIOPHILE SOUND ARCHIVE & LABORATORY
          </span>
        </div>

        {/* User Watermark */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b1b1f]/90 border border-[#343538]/70 shadow-sm">
          <span className="font-serif italic text-xs text-[#cfc6b0]">
            Coded with rage, shipped with love.
          </span>
          <span className="text-[#cfc6b0]/60 font-mono text-xs">-</span>
          <span className="font-mono text-xs font-bold text-[#FAF8F5] tracking-wide">
            By Aashish
          </span>
        </div>

        {/* Protocol & Copyright */}
        <p className="font-label-telemetry uppercase text-[10px] text-center md:text-right">
          © 2026 VIBERR Hi-Fi Broadcast Co. Sovereign Lossless Protocol.
        </p>
      </div>
    </footer>
  );
}
