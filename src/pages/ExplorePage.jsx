import React, { useState } from 'react';
import { Search, Radio, Play, Pause, Sparkles, SlidersHorizontal, Volume2, ArrowUpRight } from 'lucide-react';
import { STATIONS } from '../data/stationsData';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';

const GENRES = [
  { id: 'all', label: 'All 28 Vaults' },
  { id: 'lofi', label: '☕ Lo-Fi & Study' },
  { id: 'synthwave', label: '🌆 Synthwave & Cyberpunk' },
  { id: 'hiphop', label: '🎤 Desi Hip-Hop & Rap' },
  { id: 'phonk', label: '🏎️ Drift Phonk' },
  { id: 'ambient', label: '🌌 Ambient & Drone' },
  { id: 'electronic', label: '⚡ Electronic & Bass' },
  { id: 'bollywood', label: '✨ Retro Bollywood' }
];

export default function ExplorePage() {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { currentStation, handleSelectStation, isPlaying, togglePlay, showToast } = useAudio();
  const navigate = useNavigate();

  const filteredStations = STATIONS.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      selectedGenre === 'all' ||
      st.name.toLowerCase().includes(selectedGenre) ||
      st.tagline?.toLowerCase().includes(selectedGenre) ||
      st.description?.toLowerCase().includes(selectedGenre) ||
      st.id.includes(selectedGenre);

    return matchesSearch && matchesGenre;
  });

  const handleTuneIn = (st) => {
    handleSelectStation(st);
    if (!isPlaying) togglePlay();
    if (showToast) {
      showToast(`Tuned In: ${st.name}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#121316] text-[#e3e2e6] pt-24 pb-36 px-4 sm:px-8">
      <div className="max-w-[1280px] mx-auto flex flex-col">

        {/* Editorial Header */}
        <header className="mb-10 pb-8 border-b border-[#343538]/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/60 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
            <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest text-[10px]">
              28 SOVEREIGN RADIO FREQUENCIES // LOSSLESS MASTER CDN
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline-lg text-3xl sm:text-5xl font-serif text-[#FAF8F5] tracking-tight">
                Explore Soundscapes & Radios
              </h1>
              <p className="font-body-md text-[#c5c7c1] text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Tune into 28 curated live radio stations streaming 24-bit 96kHz lossless audio without algorithms, dynamic compression, or intrusive advertising walls.
              </p>
            </div>

            {/* Quick Filter Search */}
            <div className="relative w-full md:w-80">
              <div className="relative flex items-center p-1 rounded-xl bg-[#0d0e11] border border-[#343538]/70 focus-within:border-[#cfc6b0] transition-colors">
                <Search className="w-4 h-4 ml-3 text-[#8f918c]" />
                <input
                  type="text"
                  placeholder="Search station, mood, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-[#FAF8F5] placeholder-[#8f918c] text-xs px-3 py-2 focus:outline-none font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] font-mono text-[#8f918c] hover:text-[#FAF8F5] px-2 cursor-pointer"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Genre Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-6 scrollbar-none">
            {GENRES.map((g) => {
              const isActive = selectedGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  className={`px-4 py-1.5 rounded-full font-label-pill text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FAF8F5] text-[#121316] font-bold shadow-sm'
                      : 'bg-[#1b1b1f] hover:bg-[#292a2d] text-[#c5c7c1] hover:text-[#FAF8F5] border border-[#343538]/50'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStations.map((st, idx) => {
            const isCurrent = currentStation?.id === st.id;
            return (
              <article
                key={st.id}
                onClick={() => handleTuneIn(st)}
                className={`group flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#1b1b1f] hover:bg-[#222227] border transition-all cursor-pointer relative shadow-sm ${
                  isCurrent
                    ? 'border-[#cfc6b0] shadow-[0_0_24px_rgba(207,198,176,0.15)] bg-[#1f1f23]'
                    : 'border-[#343538]/50 hover:border-[#cfc6b0]/50'
                }`}
              >
                {/* Station Art & Status */}
                <div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-[#0d0e11] border border-white/5">
                    <img
                      src={st.desktopBgs?.[0] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'}
                      alt={st.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Channel Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#0d0e11]/80 backdrop-blur-md text-[#cfc6b0] font-mono text-[9px] uppercase border border-white/10">
                      CH {String(idx + 1).padStart(2, '0')}
                    </div>

                    {/* Live Indicator */}
                    {isCurrent && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#121316]/90 backdrop-blur-md text-[#FAF8F5] font-mono text-[9px] uppercase flex items-center gap-1.5 border border-[#cfc6b0]/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
                        <span>TUNED IN</span>
                      </div>
                    )}

                    {/* Hover Play Circle */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-[#FAF8F5] text-[#121316] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-headline-sm text-base text-[#FAF8F5] group-hover:text-[#cfc6b0] transition-colors leading-tight">
                    {st.name}
                  </h3>

                  <p className="font-body-sm text-xs text-[#c5c7c1] mt-1 line-clamp-2 leading-relaxed">
                    {st.tagline || st.description}
                  </p>
                </div>

                {/* Footer Telemetry */}
                <div className="mt-5 pt-3 border-t border-[#343538]/40 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[#8f918c] uppercase">
                    {st.songs?.length || 0} TRACKS • FLAC
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full font-label-pill text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-[#cfc6b0] text-[#121316] font-bold'
                        : 'bg-[#292a2d] text-[#FAF8F5] group-hover:bg-[#FAF8F5] group-hover:text-[#121316]'
                    }`}
                  >
                    {isCurrent ? 'ACTIVE' : 'TUNE IN'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredStations.length === 0 && (
          <div className="py-20 text-center rounded-2xl bg-[#1b1b1f] border border-[#343538]/40 mt-6">
            <Radio className="w-10 h-10 mx-auto text-[#8f918c] mb-3 opacity-40" />
            <p className="font-headline-sm text-sm text-[#FAF8F5]">No frequencies found matching "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
              }}
              className="mt-3 px-4 py-1.5 rounded-full bg-[#FAF8F5] text-[#121316] text-xs font-mono font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Site Footer with Watermark */}
        <SiteFooter />

      </div>
    </div>
  );
}
