import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Radio, Music, Play, Sparkles, Zap, Flame, Headphones } from 'lucide-react';
import { STATIONS } from '../data/stationsData';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';

const GENRES = [
  { id: 'all', label: 'All Stations' },
  { id: 'lofi', label: '☕ Lo-Fi & Study' },
  { id: 'synthwave', label: '🌆 Synthwave & Cyberpunk' },
  { id: 'hiphop', label: '🎤 Desi Hip Hop & Rap' },
  { id: 'phonk', label: '🏎️ Drift Phonk' },
  { id: 'ambient', label: '🌌 Ambient & Chill' },
  { id: 'electronic', label: '⚡ Electronic & Bass' }
];

export default function ExplorePage() {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { currentStation, handleSelectStation, isPlaying, togglePlay } = useAudio();
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
    navigate('/');
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-3 sm:px-8 py-6 pb-28 custom-scroll max-w-[1720px] mx-auto text-white">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden glass-panel-neon border border-white/20 bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-black/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>28+ CURATED 320KBPS LOSSLESS RADIO STATIONS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-syne text-white tracking-tight leading-tight">
            Explore Soundscapes & Live Radio
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-space mt-2 leading-relaxed">
            Immerse in pure high-fidelity 320k audio streams across global aesthetics, Desi Hip Hop, Synthwave, Lofi, and Ambient frequencies.
          </p>

          {/* Search Box */}
          <div className="relative mt-6 max-w-md">
            <Search className="w-4 h-4 absolute left-4 text-cyan-400 pointer-events-none top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station name, mood, or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl text-white placeholder-white/40 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-3 outline-none border border-white/15 focus:border-cyan-400/70 transition-all font-space"
            />
          </div>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scroll pb-4 mb-6 text-xs font-mono">
        {GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.id)}
            className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
              selectedGenre === g.id
                ? 'bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 font-bold shadow-lg'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredStations.map((st) => {
          const isCurrent = currentStation?.id === st.id;
          return (
            <motion.div
              key={st.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`group rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                isCurrent
                  ? 'bg-white/[0.09] border-cyan-400/70 shadow-2xl shadow-cyan-500/10'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/25'
              }`}
              onClick={() => handleTuneIn(st)}
            >
              {/* Top Row: Station Icon & Track Count */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/20"
                    style={{ backgroundColor: `${st.color || '#00f0ff'}25` }}
                  >
                    <Radio className="w-6 h-6" style={{ color: st.color || '#00f0ff' }} />
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-cyan-400/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        LIVE NOW
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px] font-mono">
                      {st.songs?.length || 0} tracks
                    </span>
                  </div>
                </div>

                {/* Station Title & Tagline */}
                <h3 className="text-lg font-bold font-syne text-white group-hover:text-cyan-300 transition-colors">
                  {st.name}
                </h3>
                <p className="text-xs text-white/60 font-space mt-1 line-clamp-2">
                  {st.tagline || st.description}
                </p>
              </div>

              {/* Bottom Row: 1-Click Tune-In Button */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                  320kbps Lossless
                </span>
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 group-hover:bg-cyan-400 group-hover:text-black text-cyan-300 flex items-center justify-center transition-all shadow-md">
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
