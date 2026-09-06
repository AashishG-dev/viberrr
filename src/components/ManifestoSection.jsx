import React from 'react';

export default function ManifestoSection() {
  return (
    <section className="py-14 border-b border-[#343538]/40" id="manifesto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Title & Slogan */}
        <div className="lg:col-span-5">
          <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest block mb-2 text-xs">
            THE ANTI-ALGORITHM MANIFESTO
          </span>
          <h2 className="font-headline-lg text-[#FAF8F5] tracking-tight leading-tight mb-6">
            Radio was never meant to be solved by computers.
          </h2>
          <p className="font-body-lg text-[#c5c7c1] font-light leading-relaxed">
            When streaming platforms surrender sound to predictive engagement scores, every track converges on lowest-common-denominator compression. VIBERR is our deliberate refusal.
          </p>
        </div>

        {/* Right Column: Narrative & Stats */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#c5c7c1] leading-relaxed text-sm">
            <p className="font-body-md">
              Every audio stream on VIBERR originates from authentic master analog reels, archival uncompressed vinyl transfers, or certified un-dithered 24-bit PCM packages. There are zero synthetic limiters, dynamic brickwalls, or loudness-war normalizers applied.
            </p>
            <p className="font-body-md">
              Our curators are sovereign sound engineers, record collectors, and physical archivists across four continents. Broadcast sequencing is manually assembled each morning, reflecting solar cycles, weather transitions, and pure human intuition.
            </p>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#343538]/40">
            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#343538]/40 flex flex-col shadow-sm">
              <span className="font-headline-lg text-[#FAF8F5] leading-none font-mono">28</span>
              <span className="font-label-telemetry text-[#8f918c] uppercase mt-2 text-[10px]">
                GLOBAL VAULTS
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#343538]/40 flex flex-col shadow-sm">
              <span className="font-headline-lg text-[#cfc6b0] leading-none font-mono">0</span>
              <span className="font-label-telemetry text-[#8f918c] uppercase mt-2 text-[10px]">
                COMMERCIAL ADS
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#343538]/40 flex flex-col shadow-sm">
              <span className="font-headline-lg text-[#FAF8F5] leading-none font-mono">100%</span>
              <span className="font-label-telemetry text-[#8f918c] uppercase mt-2 text-[10px]">
                LOSSLESS FLAC
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1b1b1f] border border-[#343538]/40 flex flex-col shadow-sm">
              <span className="font-headline-lg text-[#cfc6b0] leading-none font-mono">6+</span>
              <span className="font-label-telemetry text-[#8f918c] uppercase mt-2 text-[10px]">
                LIVE BROADCAST NODES
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
