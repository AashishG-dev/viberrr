import React from 'react';

function ManifestoSection() {
  return (
    <section className="py-12 sm:py-16 border-b border-[#2b2f33]/60 relative" id="manifesto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Title & Slogan */}
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.18em] uppercase text-[#cfc6b0]">
            <span>✦ PHILOSOPHY</span>
          </div>
          <h2 className="display-monument text-2xl sm:text-3xl lg:text-4xl text-[#FAF8F5] mb-3">
            Sound was never meant to be <span className="word-tracer">flattened</span>.
          </h2>
          <p className="font-mono text-xs text-[#8f918c] leading-relaxed tracking-wide">
            Authentic studio master transfers and uncompressed archival vinyl. Zero brickwall limiters or dynamic fatigue.
          </p>
        </div>

        {/* Right Column: Minimal Stat Cells */}
        <div className="lg:col-span-6 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-[12px] bg-[#121316] border border-[#cfc6b0]/25 flex flex-col relative group hover:border-[#cfc6b0]/50 transition-colors">
            <span className="cad-corner cad-tl" />
            <span className="cad-corner cad-br" />
            <span className="font-space text-2xl sm:text-3xl text-[#FAF8F5] leading-none font-normal">28</span>
            <span className="font-mono text-[#8f918c] uppercase mt-2 text-[9px] tracking-[0.14em]">
              VAULTS
            </span>
          </div>

          <div className="p-4 rounded-[12px] bg-[#121316] border border-[#cfc6b0]/25 flex flex-col relative group hover:border-[#cfc6b0]/50 transition-colors">
            <span className="cad-corner cad-tl" />
            <span className="cad-corner cad-br" />
            <span className="font-space text-2xl sm:text-3xl text-[#00f0ff] leading-none font-normal">100%</span>
            <span className="font-mono text-[#8f918c] uppercase mt-2 text-[9px] tracking-[0.14em]">
              LOSSLESS
            </span>
          </div>

          <div className="p-4 rounded-[12px] bg-[#121316] border border-[#cfc6b0]/25 flex flex-col relative group hover:border-[#cfc6b0]/50 transition-colors">
            <span className="cad-corner cad-tl" />
            <span className="cad-corner cad-br" />
            <span className="font-space text-2xl sm:text-3xl text-[#cfc6b0] leading-none font-normal">24-B</span>
            <span className="font-mono text-[#8f918c] uppercase mt-2 text-[9px] tracking-[0.14em]">
              DEPTH
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default React.memo(ManifestoSection);


