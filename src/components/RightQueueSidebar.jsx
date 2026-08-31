import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ListMusic, Radio, X, Play, Music, Sparkles, Trash2, Shuffle, ChevronRight, Disc, Layers
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { STATIONS } from '../data/stationsData';
import { formatTime } from '../utils/formatters';

export default function RightQueueSidebar({ isOpen, onToggle, onClose }) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'stations'
  const {
    currentTrack,
    currentTrackIndex,
    tracks,
    isPlaying,
    togglePlay,
    selectTrack,
    currentStation,
    handleSelectStation,
    toggleShuffle,
    isShuffled
  } = useAudio();

  return (
    <>
      {/* Right Edge Collapsible Trigger Tab */}
      <motion.button
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 px-2.5 py-4 rounded-l-2xl glass-panel-neon border-r-0 border border-white/20 bg-black/80 hover:bg-black/95 text-white/80 hover:text-white shadow-2xl flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 group ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        title="Open Queue & Playlist Sidebar (Q)"
        aria-label="Toggle Queue and Playlist Sidebar"
      >
        <ListMusic className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-mono tracking-widest uppercase font-bold text-white/70 group-hover:text-cyan-300">
          QUEUE ({tracks.length})
        </span>
      </motion.button>

      {/* Slide-out Glassmorphic Right Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-[420px] h-full z-50 glass-panel-neon border-l border-white/20 bg-black/90 text-white flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
                    <ListMusic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-syne text-white">Live Audio Queue</h3>
                    <p className="text-[10px] font-mono text-white/50">
                      {tracks.length} tracks • Infinite Autoplay
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isShuffled
                        ? 'bg-cyan-500/30 border-cyan-400/60 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                    title="Shuffle Queue"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                    title="Close Sidebar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-black/40 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`flex-1 py-2 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'queue'
                      ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>Up Next ({tracks.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('stations')}
                  className={`flex-1 py-2 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'stations'
                      ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Stations (28+)</span>
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-3 custom-scroll space-y-2">
                {activeTab === 'queue' ? (
                  /* Queue List */
                  tracks.length === 0 ? (
                    <div className="py-20 text-center text-white/40">
                      <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-space">Queue is currently empty</p>
                    </div>
                  ) : (
                    tracks.map((t, idx) => {
                      const isCurrent = idx === currentTrackIndex;
                      return (
                        <motion.div
                          key={t.id || idx}
                          whileHover={{ x: 2 }}
                          onClick={() => selectTrack(idx)}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                            isCurrent
                              ? 'bg-cyan-500/20 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Track thumbnail / Index */}
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/15 flex-shrink-0 flex items-center justify-center">
                              {t.thumbnail ? (
                                <img src={t.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Music className="w-4 h-4 text-cyan-400" />
                              )}
                              {isCurrent && isPlaying && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-0.5">
                                  <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full" />
                                  <span className="w-1 h-4 bg-cyan-300 animate-pulse delay-75 rounded-full" />
                                  <span className="w-1 h-2 bg-cyan-400 animate-pulse delay-150 rounded-full" />
                                </div>
                              )}
                            </div>

                            {/* Title & Artist */}
                            <div className="truncate flex-1 min-w-0">
                              <h4 className={`text-xs font-bold font-syne truncate ${isCurrent ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'}`}>
                                {t.title}
                              </h4>
                              <p className="text-[11px] text-white/50 font-space truncate mt-0.5">
                                {t.artist}
                              </p>
                            </div>
                          </div>

                          {/* Duration & Tag */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] font-mono text-white/40">
                              {formatTime(t.duration)}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 text-[9px] font-mono font-bold border border-cyan-400/40">
                                PLAYING
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )
                ) : (
                  /* Stations List */
                  STATIONS.map((st) => {
                    const isCurrentSt = currentStation?.id === st.id;
                    return (
                      <motion.div
                        key={st.id}
                        whileHover={{ x: 2 }}
                        onClick={() => handleSelectStation(st)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                          isCurrentSt
                            ? 'bg-cyan-500/20 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/20 flex-shrink-0"
                            style={{ backgroundColor: `${st.color || '#00f0ff'}25` }}
                          >
                            <Radio className="w-5 h-5" style={{ color: st.color || '#00f0ff' }} />
                          </div>
                          <div className="truncate flex-1 min-w-0">
                            <h4 className="text-xs font-bold font-syne text-white group-hover:text-cyan-300 truncate">
                              {st.name}
                            </h4>
                            <p className="text-[10px] text-white/50 font-space truncate mt-0.5">
                              {st.songs?.length || 0} lossless tracks
                            </p>
                          </div>
                        </div>

                        <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-cyan-400 group-hover:text-black flex items-center justify-center transition-all flex-shrink-0">
                          <Play className="w-3 h-3 fill-current translate-x-0.5" />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
