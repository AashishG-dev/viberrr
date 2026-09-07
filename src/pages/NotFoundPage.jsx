import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, ArrowLeft, Disc, AlertTriangle } from 'lucide-react';
import ParticleCloudCanvas from '../components/ParticleCloudCanvas';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#0d0e11] text-[#FAF8F5] pt-24 pb-28 relative overflow-hidden flex items-center justify-center">
      {/* Background Particle Cloud */}
      <ParticleCloudCanvas isPlaying={false} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full relative z-10">
        
        {/* Atlantic.vc Wireframe Card Container */}
        <div className="relative w-full rounded-[16px] bg-[#121316]/95 border border-[#cfc6b0]/25 p-8 sm:p-12 backdrop-blur-xl flex flex-col items-center text-center gap-6">
          
          {/* CAD Corner Crosshairs */}
          <span className="cad-corner cad-tl" />
          <span className="cad-corner cad-tr" />
          <span className="cad-corner cad-bl" />
          <span className="cad-corner cad-br" />

          {/* Telemetry Tag */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#1b1b1f] border border-[#cfc6b0]/30 text-[#cfc6b0] font-mono text-[10px] tracking-[0.18em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>ERR // 404 FREQUENCY VACUUM</span>
          </div>

          {/* Massive Display Monument */}
          <div>
            <span className="font-space text-7xl sm:text-9xl text-[#FAF8F5]/10 font-bold block select-none -mb-8 sm:-mb-12 tracking-widest">
              404
            </span>
            <h1 className="display-monument text-3xl sm:text-5xl text-[#FAF8F5]">
              Node <span className="word-tracer">Not Found</span>
            </h1>
          </div>

          {/* Concise Minimalist Narrative */}
          <p className="font-mono text-xs sm:text-sm text-[#8f918c] max-w-md leading-relaxed tracking-wide">
            The archival coordinate or telemetry sector you navigated to does not exist on this sovereign relay carrier.
          </p>

          {/* Action Bus */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#2b2f33] w-full">
            <button
              onClick={() => navigate('/')}
              className="wireframe-btn-accent flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO MASTER DECK</span>
            </button>

            <button
              onClick={() => navigate('/explore')}
              className="wireframe-btn flex items-center gap-2"
            >
              <Radio className="w-3.5 h-3.5 text-[#cfc6b0]" />
              <span>EXPLORE RADAR</span>
            </button>
          </div>

          {/* Diagnostic Footer */}
          <div className="flex items-center gap-3 text-[9px] font-mono text-[#8f918c] tracking-widest pt-2 uppercase">
            <span>SECTOR: 0x00_VOID</span>
            <span>•</span>
            <span>STATUS: DEREFERENCED</span>
          </div>

        </div>

      </div>
    </div>
  );
}
