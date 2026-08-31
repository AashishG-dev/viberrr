import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, Heart, Play } from 'lucide-react';
import { formatTime, toggleTrackLike, isTrackLiked } from '../utils/formatters';

export default function PlaylistModal({
  isOpen,
  onClose,
  station,
  tracks = [],
  currentTrack,
  currentTrackIndex,
  isPlaying,
  onSelectTrack
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [likedMap, setLikedMap] = useState({});
  const activeTrackRef = useRef(null);

  // Initialize liked map from local storage
  useEffect(() => {
    const map = {};
    tracks.forEach((t) => {
      if (isTrackLiked(t.id)) {
        map[t.id] = true;
      }
    });
    setLikedMap(map);
  }, [tracks]);

  // Scroll active track into view on open
  useEffect(() => {
    if (isOpen && activeTrackRef.current) {
      setTimeout(() => {
        activeTrackRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTracks = tracks.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.artist.toLowerCase().includes(term)
    );
  });

  const handleLikeClick = (e, trackId) => {
    e.stopPropagation();
    const newState = toggleTrackLike(trackId);
    setLikedMap((prev) => ({
      ...prev,
      [trackId]: newState
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl pointer-events-auto transition-all duration-300"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-xl max-h-[88vh] sm:max-h-[84vh] flex flex-col rounded-t-3xl sm:rounded-3xl glass-panel-neon shadow-2xl overflow-hidden border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-black/40">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-inner border border-white/20"
                style={{ backgroundColor: `${station?.color || '#00f0ff'}22` }}
              >
                <Music className="w-5 h-5" style={{ color: station?.color || '#00f0ff' }} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-syne text-white leading-tight">
                  {station?.name}
                </h3>
                <p className="text-xs font-mono text-white/60 mt-0.5">
                  <span>{tracks.length} lossless tracks</span> • [ CLICK TRACK TO PLAY ]
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="glass-button p-2.5 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Playlist"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:p-4 border-b border-white/10 bg-black/50">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Filter tracks by title or artist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/40 text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:bg-white/15 focus:ring-1 focus:ring-cyan-400/60 transition-all border border-white/15"
                autoFocus
              />
            </div>
          </div>

          {/* Song List Items */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scroll">
            {filteredTracks.length === 0 ? (
              <div className="text-center py-12 text-white/50 text-xs font-mono">
                [ NO TRACKS MATCHING "{searchTerm}" ]
              </div>
            ) : (
              filteredTracks.map((t, idx) => {
                const originalIndex = tracks.findIndex((track) => track.id === t.id);
                const isActive = currentTrack?.id === t.id;
                const isLiked = !!likedMap[t.id];

                return (
                  <motion.div
                    key={t.id}
                    ref={isActive ? activeTrackRef : null}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onSelectTrack(originalIndex !== -1 ? originalIndex : idx);
                    }}
                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                      isActive
                        ? 'bg-white/20 border-cyan-400/50 text-white shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                        : 'hover:bg-white/10 border-transparent hover:border-white/10 text-neutral-200'
                    }`}
                  >
                    {/* Left: Track Index / EQ bars & Info */}
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                      <div className="w-8 sm:w-9 text-center flex-shrink-0 flex items-center justify-center">
                        {isActive && isPlaying ? (
                          <div className="eq-container flex-shrink-0">
                            <span className="eq-bar" />
                            <span className="eq-bar" />
                            <span className="eq-bar" />
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm font-mono font-bold text-white/40 group-hover:text-white/80 transition-colors">
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold font-syne truncate transition-colors ${
                            isActive ? 'text-cyan-300' : 'text-white/90 group-hover:text-white'
                          }`}
                        >
                          {t.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs font-space text-white/50 truncate mt-0.5">
                          {t.artist}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration & Like Heart Button */}
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-[11px] font-mono text-white/40">
                        {formatTime(t.duration)}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleLikeClick(e, t.id)}
                        className={`p-2 rounded-full border transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-red-500/25 border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                            : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/40 hover:text-red-400'
                        }`}
                        title={isLiked ? 'Liked' : 'Like track'}
                        aria-label="Like track"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
