import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Lock, X } from 'lucide-react';

export default function SecurityThreatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [threatCount, setThreatCount] = useState(0);

  useEffect(() => {
    const handleThreat = (e) => {
      setThreatCount((prev) => prev + 1);
      setIsOpen(true);
    };

    window.addEventListener('viberr:threat-detected', handleThreat);
    return () => window.removeEventListener('viberr:threat-detected', handleThreat);
  }, []);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 rounded-[16px] bg-[#0e0f12] border border-red-500/40 shadow-2xl flex flex-col gap-4">
        
        {/* CAD Corner Crosshairs in Alert Red */}
        <span className="cad-corner cad-tl !border-red-500" />
        <span className="cad-corner cad-tr !border-red-500" />
        <span className="cad-corner cad-bl !border-red-500" />
        <span className="cad-corner cad-br !border-red-500" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-red-400">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>SHIELD DEFENSE // LEVEL 01</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#8f918c] hover:text-[#FAF8F5] cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2">
          <h3 className="display-monument text-xl text-[#FAF8F5]">
            Unauthorized Inspection <span className="text-red-400">Blocked</span>
          </h3>
          <p className="font-mono text-xs text-[#8f918c] leading-relaxed">
            Sovereign audio codecs, source telemetry, and proprietary routing matrices are cryptographically shielded against inspection and exfiltration.
          </p>
        </div>

        {/* Diagnostic Slate */}
        <div className="p-3 rounded-[8px] bg-[#121316] border border-red-500/25 font-mono text-[10px] text-[#8f918c] flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span>ANTI-DEBUG HARNESS:</span>
            <span className="text-red-400 font-semibold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between">
            <span>MEDIA ASSET DRIFT:</span>
            <span className="text-[#FAF8F5]">INTERCEPTED (0x0{threatCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <span>STATUS:</span>
            <span className="text-[#00f0ff]">SESSION ENCRYPTED</span>
          </div>
        </div>

        {/* Dismiss Action */}
        <button
          onClick={() => setIsOpen(false)}
          className="wireframe-btn !border-red-500/50 !text-red-400 hover:!bg-red-500/10 !w-full justify-center !mt-1"
        >
          [ ACKNOWLEDGE & RESUME ]
        </button>

      </div>
    </div>
  );
}
