import React from 'react';

export default function SiteFooter() {
  return (
    <footer className="w-full bg-[#0d0e11] rounded-[16px] mt-16 p-6 sm:p-8 border border-[#2b2f33] relative font-mono">
      <span className="cad-corner cad-tl" />
      <span className="cad-corner cad-br" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[#8f918c]">
        {/* Brand identity */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="font-space text-base text-[#FAF8F5] tracking-tight font-normal">
            viberr<span className="text-[#00f0ff]">.</span>matrix
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#cfc6b0]/70 hidden sm:inline">
            // AUDIOPHILE OBSERVATORY & LABORATORY
          </span>
        </div>

        {/* User Watermark */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-[6px] bg-[#121316] border border-[#cfc6b0]/30 text-xs">
          <span className="text-[#cfc6b0] text-[11px]">
            Coded with rage, shipped with love.
          </span>
          <span className="text-[#cfc6b0]/40">-</span>
          <span className="font-mono text-xs font-semibold text-[#FAF8F5] tracking-wide">
            By Aashish
          </span>
        </div>

        {/* Protocol & Copyright */}
        <p className="text-[9px] uppercase tracking-[0.16em] text-center md:text-right text-[#8f918c]">
          © 2026 VIBERR MATRIX. SOVEREIGN LOSSLESS DISPATCH PROTOCOL.
        </p>
      </div>
    </footer>
  );
}

