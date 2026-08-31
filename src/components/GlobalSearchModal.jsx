import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Music, Radio, Play, 
  Sparkles, Loader2, Disc3, ExternalLink, Zap
} from 'lucide-react';
import { streamResolver } from '../services/streaming/StreamResolver';
import { formatTime } from '../utils/formatters';

const YoutubeIcon = ({ className = "w-4 h-4 text-red-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SpotifyIcon = ({ className = "w-4 h-4 text-emerald-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.306c-.215.353-.674.464-1.026.25-2.809-1.716-6.345-2.104-10.51-1.152-.403.092-.808-.163-.9-.566-.092-.403.163-.808.566-.9 4.568-1.044 8.497-.601 11.62 1.342.352.215.464.674.25 1.026zm1.464-3.257c-.27.44-.848.58-1.288.31-3.216-1.977-8.118-2.548-11.921-1.393-.497.15-1.029-.133-1.18-.63-.15-.497.133-1.03.63-1.18 4.348-1.32 9.754-.68 13.449 1.595.44.27.58.848.31 1.288zm.126-3.41c-3.856-2.29-10.222-2.5-13.896-1.385-.592.18-1.222-.154-1.402-.746-.18-.592.154-1.222.746-1.402 4.227-1.283 11.26-1.038 15.69 1.593.533.316.708 1.011.392 1.544-.316.533-1.011.708-1.544.392z"/>
  </svg>
);

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onPlayTrack,
  onSelectStation
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ curated: [], spotify: [], youtube: [], stations: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'curated' | 'spotify' | 'youtube' | 'stations'
  const [resolvingId, setResolvingId] = useState(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults({ curated: [], spotify: [], youtube: [], stations: [] });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ curated: [], spotify: [], youtube: [], stations: [] });
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
        stations: data.stations || []
      });
      setIsSearching(false);
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  // Handle Play selection with Infinite Queue (Instant 0ms Handoff)
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
      const currentPool = [
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

  if (!isOpen) return null;

  const totalResults =
    (results.curated?.length || 0) +
    (results.spotify?.length || 0) +
    (results.youtube?.length || 0) +
    (results.stations?.length || 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl pointer-events-auto transition-all"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full max-w-2xl max-h-[85vh] rounded-3xl glass-panel-neon border border-white/20 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col relative bg-black/90 text-white mt-12 sm:mt-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & Search Bar */}
          <div className="relative flex items-center gap-3 pb-3 border-b border-white/10 flex-shrink-0">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 absolute left-3.5 text-cyan-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Spotify catalog, YouTube, or 28+ stations (e.g. MTV Hustle, KR$NA, Paradox)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/40 text-xs sm:text-sm rounded-2xl pl-11 pr-10 py-3 outline-none border border-white/15 focus:border-cyan-400/60 focus:bg-white/[0.12] transition-all font-space"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 absolute right-3.5 text-cyan-300 animate-spin" />
              ) : query ? (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 text-white/40 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="glass-button p-2.5 rounded-full text-white/70 hover:text-white cursor-pointer flex-shrink-0"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Source Tabs */}
          {query.trim() && (
            <div className="flex items-center gap-2 pt-3 pb-2 overflow-x-auto custom-scroll flex-shrink-0 text-xs font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 shadow-md font-bold'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                All Sources ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('spotify')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'spotify'
                    ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 font-bold'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <SpotifyIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spotify / Global ({results.spotify?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('curated')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'curated'
                    ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 font-bold'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Lossless CDN ({results.curated?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'youtube'
                    ? 'bg-red-500/25 border border-red-400/50 text-red-200 font-bold'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
                <span>YouTube ({results.youtube?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('stations')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'stations'
                    ? 'bg-purple-500/25 border border-purple-400/50 text-purple-200 font-bold'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3 text-purple-400" />
                <span>Stations ({results.stations?.length || 0})</span>
              </button>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-2 custom-scroll min-h-[260px] max-h-[58vh]">
            {!query.trim() ? (
              <div className="py-12 text-center text-white/40 space-y-2">
                <Music className="w-10 h-10 mx-auto text-white/20 animate-pulse" />
                <p className="text-xs font-mono">[ TYPE TO SEARCH 2,229+ LOSSLESS SONGS & YOUTUBE STREAMS ]</p>
                <p className="text-[11px] font-space text-white/30">
                  Search by song name, artist, genre, or YouTube query.
                </p>
              </div>
            ) : isSearching && totalResults === 0 ? (
              <div className="py-12 text-center text-white/50 text-xs font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>[ SEARCHING UNIVERSAL STREAM PLUGINS... ]</span>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-12 text-center text-white/50 text-xs font-mono">
                [ NO SONGS MATCHING "{query}" ]
              </div>
            ) : (
              <>
                {/* Station Matches */}
                {(activeTab === 'all' || activeTab === 'stations') && results.stations.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-purple-300/80 font-bold px-1 uppercase tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      <span>Matching Stations</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.stations.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            onSelectStation(st);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 hover:border-purple-400/40 text-left transition-all cursor-pointer group"
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: `${st.color || '#00f0ff'}33` }}
                          >
                            <Radio className="w-4 h-4" style={{ color: st.color || '#00f0ff' }} />
                          </div>
                          <div className="truncate flex-1 min-w-0">
                            <h4 className="text-xs font-bold font-syne text-white truncate group-hover:text-purple-300">
                              {st.name}
                            </h4>
                            <p className="text-[10px] text-white/50 truncate font-space">
                              {st.songs?.length || 0} lossless tracks
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spotify & Global Music Matches */}
                {(activeTab === 'all' || activeTab === 'spotify') && results.spotify?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-emerald-300 font-bold px-1 uppercase tracking-wider flex items-center gap-1.5">
                      <SpotifyIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Spotify & Global Music Tracks</span>
                    </div>
                    {results.spotify.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => handleSelectTrack(song)}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                            {song.thumbnail ? (
                              <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div className="truncate flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold font-syne text-white truncate group-hover:text-emerald-300">
                                {song.title}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold flex-shrink-0">
                                SPOTIFY HQ
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 font-space truncate mt-0.5">
                              {song.artist} {song.album ? `• ${song.album}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-[11px] font-mono text-white/40">
                            {formatTime(song.duration)}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-emerald-500 group-hover:text-black text-white flex items-center justify-center transition-all">
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Curated Lossless CDN Matches */}
                {(activeTab === 'all' || activeTab === 'curated') && results.curated?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-cyan-300/80 font-bold px-1 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>Lossless Station Tracks</span>
                    </div>
                    {results.curated.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => handleSelectTrack(song)}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                            {song.thumbnail ? (
                              <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div className="truncate flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold font-syne text-white truncate group-hover:text-emerald-300">
                                {song.title}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold flex-shrink-0">
                                LOSSLESS
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 font-space truncate mt-0.5">
                              {song.artist} • <span className="text-white/40">{song.stationName}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-[11px] font-mono text-white/40">
                            {formatTime(song.duration)}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-emerald-500 group-hover:text-black text-white flex items-center justify-center transition-all">
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* YouTube Invidious Universal Stream Matches */}
                {(activeTab === 'all' || activeTab === 'youtube') && results.youtube.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-mono text-red-300/90 font-bold px-1 uppercase tracking-wider flex items-center gap-1">
                      <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
                      <span>YouTube Live Stream Engine</span>
                    </div>
                    {results.youtube.map((video) => {
                      const isResolving = resolvingId === video.id;

                      return (
                        <div
                          key={video.id}
                          onClick={() => !isResolving && handleSelectTrack(video)}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-red-400/40 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center relative">
                              <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                              <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] font-mono rounded text-white">
                                YT
                              </span>
                            </div>
                            <div className="truncate flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold font-syne text-white truncate group-hover:text-red-300">
                                  {video.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-white/50 font-space truncate mt-0.5">
                                {video.artist}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {video.duration > 0 && (
                              <span className="text-[11px] font-mono text-white/40">
                                {formatTime(video.duration)}
                              </span>
                            )}
                            <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-red-500 group-hover:text-white text-white flex items-center justify-center transition-all">
                              {isResolving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
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

          {/* Footer Shortcuts hint */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40 flex-shrink-0">
            <span>Powered by Nuclear Stream Engine</span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80">ESC</kbd> to exit</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
