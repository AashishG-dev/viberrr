import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Music, Radio, Play, 
  Loader2, Disc3, Zap, Activity, Waves
} from 'lucide-react';
import { streamResolver } from '../services/streaming/StreamResolver';
import { formatTime } from '../utils/formatters';

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onPlayTrack,
  onSelectStation
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ curated: [], spotify: [], youtube: [], stations: [], allRanked: [], topMatch: null });
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'spotify' | 'youtube' | 'curated' | 'stations'
  const [resolvingId, setResolvingId] = useState(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults({ curated: [], spotify: [], youtube: [], stations: [], allRanked: [], topMatch: null });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ curated: [], spotify: [], youtube: [], stations: [], allRanked: [], topMatch: null });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      const data = await streamResolver.searchGlobal(query);
      setResults({
        curated: data.curated || [],
        spotify: data.spotify || [],
        youtube: data.youtube || [],
        stations: data.stations || [],
        allRanked: data.allRanked || [],
        topMatch: data.topMatch || null
      });
      setIsSearching(false);
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  // ESC key listener to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Play selection with Instant 0ms Handoff
  const handleSelectTrack = (trackItem) => {
    try {
      const cleanVideoId = trackItem.videoId || (trackItem.source === 'youtube' ? trackItem.id.replace(/^yt_/, '') : '');
      const playable = {
        ...trackItem,
        videoId: cleanVideoId,
        isYouTubeEngine: Boolean(cleanVideoId && !trackItem.url),
        duration: trackItem.duration || 210
      };

      // Collect all related tracks from current search results to prime the queue
      const currentPool = results.allRanked?.length > 0
        ? results.allRanked
        : [
            ...(results.spotify || []),
            ...(results.curated || []),
            ...(results.youtube || [])
          ];

      onPlayTrack(playable, currentPool);
      onClose();
    } catch (e) {
      console.error('Error selecting track:', e);
    }
  };

  const totalResults = results.allRanked?.length || (
    (results.curated?.length || 0) +
    (results.spotify?.length || 0) +
    (results.youtube?.length || 0) +
    (results.stations?.length || 0)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0d0e11]/85 backdrop-blur-md pointer-events-auto"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-3xl max-h-[86vh] bg-[#121316] border border-[#cfc6b0]/35 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col relative text-[#FAF8F5] pointer-events-auto z-50 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Crosshairs */}
            <span className="cad-corner cad-tl" />
            <span className="cad-corner cad-tr" />
            <span className="cad-corner cad-bl" />
            <span className="cad-corner cad-br" />

            {/* Top Telemetry Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#cfc6b0]/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="telemetry-tag">
                CAD // 01 SEARCH RELAY
              </span>
              <span className="text-[10px] font-mono text-[#FAF8F5]/40 tracking-wider">
                SOVEREIGN FREQUENCY RESOLVER
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 border border-[#cfc6b0]/30 text-[#FAF8F5]/70 hover:text-[#121316] hover:bg-[#FAF8F5] transition-all cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative flex items-center pt-3 pb-3 border-b border-[#cfc6b0]/15 flex-shrink-0">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-[#cfc6b0] pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Query studio master repertory, acoustic matrices, or lossless airplay..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#18191d] text-[#FAF8F5] placeholder-[#FAF8F5]/40 text-xs sm:text-sm pl-10 pr-10 py-3 outline-none border border-[#cfc6b0]/25 focus:border-[#cfc6b0] focus:bg-[#232529] transition-all font-mono"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 absolute right-3.5 text-[#cfc6b0] animate-spin" />
              ) : query ? (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 text-[#FAF8F5]/40 hover:text-[#FAF8F5] p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Category Filter Tabs */}
          {query.trim() && (
            <div className="flex items-center gap-2 pt-3 pb-2 overflow-x-auto custom-scroll flex-shrink-0 text-xs font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                  activeTab === 'all'
                    ? 'wireframe-btn-cyan font-bold'
                    : 'wireframe-btn opacity-60 hover:opacity-100'
                }`}
              >
                ALL RESULTS ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('spotify')}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'spotify'
                    ? 'wireframe-btn-accent font-bold'
                    : 'wireframe-btn opacity-60 hover:opacity-100'
                }`}
              >
                <Activity className="w-3 h-3 text-[#cfc6b0]" />
                <span>GLOBAL SONGS ({results.spotify?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'youtube'
                    ? 'wireframe-btn-accent font-bold'
                    : 'wireframe-btn opacity-60 hover:opacity-100'
                }`}
              >
                <Waves className="w-3 h-3 text-[#FAF8F5]" />
                <span>YOUTUBE FULL ({results.youtube?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('curated')}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'curated'
                    ? 'wireframe-btn-accent font-bold'
                    : 'wireframe-btn opacity-60 hover:opacity-100'
                }`}
              >
                <Zap className="w-3 h-3 text-[#00f0ff]" />
                <span>LOSSLESS CDN ({results.curated?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('stations')}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === 'stations'
                    ? 'wireframe-btn-accent font-bold'
                    : 'wireframe-btn opacity-60 hover:opacity-100'
                }`}
              >
                <Radio className="w-3 h-3 text-[#cfc6b0]" />
                <span>STATIONS ({results.stations?.length || 0})</span>
              </button>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-2.5 custom-scroll min-h-[260px] max-h-[56vh]">
            {!query.trim() ? (
              <div className="py-14 text-center text-[#FAF8F5]/50 space-y-2">
                <Music className="w-8 h-8 mx-auto text-[#00f0ff]/60 animate-pulse" />
                <p className="text-xs font-mono tracking-widest text-[#FAF8F5]/70">
                  [ SEARCH OVER 100M+ TRACKS, LOSSLESS FLAC & DIRECT FEEDS ]
                </p>
                <p className="text-[11px] font-mono text-[#FAF8F5]/40">
                  Search any song by title, artist, or acoustic station.
                </p>
              </div>
            ) : isSearching && totalResults === 0 ? (
              <div className="py-14 text-center text-[#00f0ff] text-xs font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#00f0ff]" />
                <span>[ SCANNING GLOBAL DISCOGRAPHY & LOSSLESS CHANNELS... ]</span>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-14 text-center text-[#FAF8F5]/60 text-xs font-mono">
                [ NO RESULTS MATCHING "{query}" ]
              </div>
            ) : (
              <>
                {/* 1. TOP RELEVANCY MATCH SHOWCASE CARD */}
                {results.topMatch && (activeTab === 'all' || activeTab === 'spotify') && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] text-[#00f0ff] uppercase tracking-widest font-semibold px-1">
                      <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>TOP MATCH // BEST RELEVANCY</span>
                    </div>

                    <div
                      onClick={() => handleSelectTrack(results.topMatch)}
                      className="top-match-card p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:border-[#00f0ff] transition-all group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="relative w-13 h-13 sm:w-16 sm:h-16 rounded-[10px] overflow-hidden bg-[#0d0e12] border border-[#00f0ff]/40 flex-shrink-0 shadow-md">
                          <img
                            src={results.topMatch.thumbnail || '/favicon.svg'}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-semibold text-[#FFFFFF] font-space truncate group-hover:text-[#00f0ff] transition-colors">
                              {results.topMatch.title}
                            </span>
                            <span className="bg-[#00f0ff]/20 text-[#00f0ff] text-[9px] font-mono px-2 py-0.5 rounded-[4px] border border-[#00f0ff]/40 font-bold flex-shrink-0">
                              BEST RESULT
                            </span>
                          </div>
                          <p className="text-xs text-[#C8CCD4] font-mono truncate mt-0.5">
                            {results.topMatch.artist} {results.topMatch.album ? `• ${results.topMatch.album}` : ''}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#9ca0a8] mt-1">
                            <span className="text-[#00f0ff]">{results.topMatch.sourceLabel || 'Studio Master'}</span>
                            <span>•</span>
                            <span>{formatTime(results.topMatch.duration)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-10 h-10 rounded-[10px] border border-[#00f0ff] bg-[#00f0ff]/15 group-hover:bg-[#00f0ff] group-hover:text-[#0c0d12] text-[#00f0ff] flex items-center justify-center transition-all shadow-md">
                          <Play className="w-4 h-4 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. STATION MATCHES */}
                {(activeTab === 'all' || activeTab === 'stations') && results.stations.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-[#cfc6b0] font-bold px-1 uppercase tracking-widest flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-[#cfc6b0]" />
                      <span>RESONANCE STATIONS</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.stations.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            onSelectStation(st);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 p-2.5 bg-[#14161f] hover:bg-[#1f222d] border border-[#cfc6b0]/20 hover:border-[#cfc6b0]/60 text-left transition-all cursor-pointer group rounded-[10px]"
                        >
                          <div
                            className="w-8 h-8 rounded-[6px] flex items-center justify-center border border-[#cfc6b0]/30 flex-shrink-0"
                            style={{ backgroundColor: `${st.color || '#cfc6b0'}15` }}
                          >
                            <Radio className="w-4 h-4" style={{ color: st.color || '#cfc6b0' }} />
                          </div>
                          <div className="truncate flex-1 min-w-0">
                            <h4 className="text-xs font-bold font-mono text-[#FAF8F5] truncate group-hover:text-[#cfc6b0]">
                              {st.name}
                            </h4>
                            <p className="text-[10px] text-[#9ca0a8] truncate font-mono">
                              {st.songs?.length || 0} lossless tracks // 24-BIT
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. UNIFIED RANKED SONGS (When 'all' is selected) */}
                {activeTab === 'all' && (results.allRanked?.length > 0 ? (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-[#00f0ff] font-bold px-1 uppercase tracking-widest flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>ALL RELEVANT SONGS ({results.allRanked.length})</span>
                    </div>
                    {results.allRanked.map((song, idx) => (
                      <div
                        key={song.id || idx}
                        onClick={() => handleSelectTrack(song)}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-[#14161f] hover:bg-[#1e212c] border border-white/10 hover:border-[#00f0ff]/60 text-left transition-all cursor-pointer group rounded-[10px] shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="font-mono text-[10px] text-[#9ca0a8] w-5 text-center flex-shrink-0">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>

                          <div className="w-10 h-10 rounded-[6px] border border-white/10 flex-shrink-0 flex items-center justify-center bg-[#090a0e] overflow-hidden">
                            {song.thumbnail ? (
                              <img src={song.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                            ) : (
                              <Disc3 className="w-4 h-4 text-[#cfc6b0]" />
                            )}
                          </div>
                          <div className="truncate flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium font-space text-[#FFFFFF] truncate group-hover:text-[#00f0ff] transition-colors">
                                {song.title}
                              </span>
                              <span className="telemetry-tag text-[8px] py-0.2 px-1">
                                {song.sourceLabel || '24-BIT'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#C4C8D0] font-mono truncate mt-0.5">
                              {song.artist} {song.album ? `// ${song.album}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-[#9ca0a8]">
                            {formatTime(song.duration)}
                          </span>
                          <div className="w-7 h-7 rounded-[6px] border border-[#cfc6b0]/30 group-hover:border-[#00f0ff] group-hover:bg-[#00f0ff] group-hover:text-[#0c0d12] text-[#FAF8F5] flex items-center justify-center transition-all">
                            <Play className="w-3 h-3 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null)}

                {/* 4. GLOBAL CATALOG (SPOTIFY) TAB */}
                {activeTab === 'spotify' && results.spotify?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-[#cfc6b0] font-bold px-1 uppercase tracking-widest flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>GLOBAL CATALOG DISCOGRAPHY</span>
                    </div>
                    {results.spotify.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => handleSelectTrack(song)}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-[#14161f] hover:bg-[#1e212c] border border-white/10 hover:border-[#cfc6b0]/50 text-left transition-all cursor-pointer group rounded-[10px]"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-[6px] border border-white/10 flex-shrink-0 flex items-center justify-center bg-[#090a0e] overflow-hidden">
                            {song.thumbnail ? (
                              <img src={song.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                            ) : (
                              <Disc3 className="w-4 h-4 text-[#cfc6b0]" />
                            )}
                          </div>
                          <div className="truncate flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium font-space text-[#FFFFFF] truncate group-hover:text-[#cfc6b0]">
                                {song.title}
                              </span>
                              <span className="telemetry-tag text-[8px] py-0.2 px-1">
                                24-BIT
                              </span>
                            </div>
                            <p className="text-[10px] text-[#C4C8D0] font-mono truncate mt-0.5">
                              {song.artist} {song.album ? `// ${song.album}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-[#9ca0a8]">
                            {formatTime(song.duration)}
                          </span>
                          <div className="w-7 h-7 rounded-[6px] border border-[#cfc6b0]/40 group-hover:border-[#FAF8F5] group-hover:bg-[#FAF8F5] group-hover:text-[#121316] text-[#FAF8F5] flex items-center justify-center transition-all">
                            <Play className="w-3 h-3 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. CURATED LOSSLESS CDN TAB */}
                {activeTab === 'curated' && results.curated?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-[#00f0ff] font-bold px-1 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-[#00f0ff]" />
                      <span>LOSSLESS MATRIX // FLAC DIRECT</span>
                    </div>
                    {results.curated.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => handleSelectTrack(song)}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-[#14161f] hover:bg-[#1e212c] border border-white/10 hover:border-[#00f0ff]/50 text-left transition-all cursor-pointer group rounded-[10px]"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-[6px] border border-white/10 flex-shrink-0 flex items-center justify-center bg-[#090a0e] overflow-hidden">
                            {song.thumbnail ? (
                              <img src={song.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                            ) : (
                              <Music className="w-4 h-4 text-[#00f0ff]" />
                            )}
                          </div>
                          <div className="truncate flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium font-space text-[#FFFFFF] truncate group-hover:text-[#00f0ff]">
                                {song.title}
                              </span>
                              <span className="telemetry-tag text-[8px] py-0.2 px-1 text-[#00f0ff] border-[#00f0ff]/30">
                                FLAC 96k
                              </span>
                            </div>
                            <p className="text-[10px] text-[#C4C8D0] font-mono truncate mt-0.5">
                              {song.artist} // <span className="text-[#9ca0a8]">{song.stationName}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-[#9ca0a8]">
                            {formatTime(song.duration)}
                          </span>
                          <div className="w-7 h-7 rounded-[6px] border border-[#cfc6b0]/40 group-hover:border-[#00f0ff] group-hover:bg-[#00f0ff] group-hover:text-[#121316] text-[#FAF8F5] flex items-center justify-center transition-all">
                            <Play className="w-3 h-3 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 6. YOUTUBE FULL TRACKS TAB */}
                {activeTab === 'youtube' && results.youtube?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-[#FAF8F5]/80 font-bold px-1 uppercase tracking-widest flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-[#cfc6b0]" />
                      <span>YOUTUBE FULL TRACKS</span>
                    </div>
                    {results.youtube.map((video) => {
                      const isResolving = resolvingId === video.id;

                      return (
                        <div
                          key={video.id}
                          onClick={() => !isResolving && handleSelectTrack(video)}
                          className="flex items-center justify-between p-2.5 sm:p-3 bg-[#14161f] hover:bg-[#1e212c] border border-white/10 hover:border-[#cfc6b0]/50 text-left transition-all cursor-pointer group rounded-[10px]"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-8 rounded-[4px] border border-white/10 flex-shrink-0 flex items-center justify-center relative bg-[#090a0e] overflow-hidden">
                              <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                            </div>
                            <div className="truncate flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-medium font-space text-[#FFFFFF] truncate group-hover:text-[#cfc6b0]">
                                  {video.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#C4C8D0] font-mono truncate mt-0.5">
                                {video.artist}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            {video.duration > 0 && (
                              <span className="text-[10px] font-mono text-[#9ca0a8]">
                                {formatTime(video.duration)}
                              </span>
                            )}
                            <div className="w-7 h-7 rounded-[6px] border border-[#cfc6b0]/40 group-hover:border-[#FAF8F5] group-hover:bg-[#FAF8F5] group-hover:text-[#121316] text-[#FAF8F5] flex items-center justify-center transition-all">
                              {isResolving ? (
                                <Loader2 className="w-3 h-3 animate-spin text-[#cfc6b0]" />
                              ) : (
                                <Play className="w-3 h-3 fill-current translate-x-0.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Shortcuts hint & Protocol metadata */}
          <div className="mt-3 pt-3 border-t border-[#cfc6b0]/15 flex items-center justify-between text-[10px] font-mono text-[#FAF8F5]/40 flex-shrink-0">
            <span>VIBERR // SOVEREIGN AUDIO MATRIX PROTOCOL</span>
            <span>PRESS <kbd className="px-1.5 py-0.5 bg-[#18191d] border border-[#cfc6b0]/30 text-[#FAF8F5]">ESC</kbd> TO DISMISS</span>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
