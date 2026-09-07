import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ListMusic, Radio, X, Play, Music, Sparkles, Trash2, Shuffle, ChevronRight, Disc, Layers, Plus
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
    isShuffled,
    userQueue,
    removeFromUserQueue,
    clearUserQueue,
    playDirectTrack,
    handlePlayNext
  } = useAudio();

  const totalUpcomingCount = (userQueue?.length || 0) + Math.max(0, tracks.length - (currentTrackIndex + 1));

  return (
    <>
      {/* Right Edge Wireframe Trigger Tab */}
      <motion.button
        whileHover={{ scale: 1.04, x: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 px-2 py-3.5 rounded-l-[10px] border-r-0 border border-[#cfc6b0]/30 bg-[#121316]/95 hover:bg-[#1b1b1f] text-[#cfc6b0] shadow-2xl flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 backdrop-blur-md group ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        title="Open Queue & Stations (Q)"
        aria-label="Toggle Queue and Station Carriers"
      >
        <ListMusic className="w-3.5 h-3.5 text-[#cfc6b0] group-hover:text-[#FAF8F5] transition-colors" />
        <span className="[writing-mode:vertical-lr] text-[9px] font-mono tracking-[0.2em] uppercase text-[#8f918c] group-hover:text-[#FAF8F5]">
          QUEUE {userQueue?.length > 0 ? `(${userQueue.length})` : ''}
        </span>
      </motion.button>

      {/* Slide-out Wireframe Right Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-[420px] h-full z-50 border-l border-[#cfc6b0]/25 bg-[#0d0e11]/98 text-[#FAF8F5] flex flex-col shadow-2xl overflow-hidden pointer-events-auto backdrop-blur-xl"
            >
              {/* CAD Corner Crosshairs */}
              <span className="cad-corner cad-tl" />
              <span className="cad-corner cad-bl" />

              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#2b2f33] flex items-center justify-between bg-[#121316]/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[8px] bg-[#1b1b1f] text-[#cfc6b0] flex items-center justify-center border border-[#cfc6b0]/30">
                    <ListMusic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-space font-medium text-[#FAF8F5]">Telemetry Queue</h3>
                    <p className="text-[10px] font-mono text-[#8f918c] tracking-wider uppercase">
                      {userQueue?.length || 0} Queued • {tracks.length} Carrier Tracks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-[8px] border transition-all cursor-pointer ${
                      isShuffled
                        ? 'bg-[#cfc6b0]/20 border-[#cfc6b0] text-[#FAF8F5]'
                        : 'bg-[#1b1b1f] border-[#2b2f33] text-[#8f918c] hover:text-[#FAF8F5] hover:border-[#cfc6b0]/40'
                    }`}
                    title={isShuffled ? 'Shuffle Active' : 'Enable Shuffle'}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-[8px] bg-[#1b1b1f] hover:bg-[#232529] border border-[#2b2f33] hover:border-[#cfc6b0]/40 text-[#8f918c] hover:text-[#FAF8F5] transition-all cursor-pointer"
                    title="Close Sidebar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 p-3 border-b border-[#2b2f33] bg-[#0d0e11] text-xs font-mono">
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`flex-1 py-1.5 rounded-[8px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border uppercase tracking-[0.14em] text-[11px] ${
                    activeTab === 'queue'
                      ? 'bg-[#232529] border-[#cfc6b0]/60 text-[#FAF8F5] font-semibold'
                      : 'border-transparent text-[#8f918c] hover:text-[#FAF8F5] hover:bg-[#121316]'
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5 text-[#cfc6b0]" />
                  <span>Up Next ({userQueue?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('stations')}
                  className={`flex-1 py-1.5 rounded-[8px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border uppercase tracking-[0.14em] text-[11px] ${
                    activeTab === 'stations'
                      ? 'bg-[#232529] border-[#cfc6b0]/60 text-[#FAF8F5] font-semibold'
                      : 'border-transparent text-[#8f918c] hover:text-[#FAF8F5] hover:bg-[#121316]'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-[#cfc6b0]" />
                  <span>Carriers ({STATIONS.length})</span>
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-6">
                {activeTab === 'queue' ? (
                  <>
                    {/* SECTION 1: USER PRIORITY QUEUE ("UP NEXT") */}
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#2b2f33] font-mono text-[10px] uppercase tracking-[0.16em]">
                        <div className="flex items-center gap-1.5 text-[#cfc6b0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                          <span>USER PRIORITY // UP NEXT ({userQueue?.length || 0})</span>
                        </div>
                        {userQueue?.length > 0 && (
                          <button
                            onClick={clearUserQueue}
                            className="text-[9px] text-[#8f918c] hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Clear User Queue"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>CLEAR</span>
                          </button>
                        )}
                      </div>

                      {userQueue?.length === 0 ? (
                        <div className="p-4 rounded-[10px] border border-dashed border-[#2b2f33] bg-[#121316]/40 text-center font-mono">
                          <p className="text-[11px] text-[#8f918c]">No user tracks queued.</p>
                          <p className="text-[9px] text-[#8f918c]/60 mt-0.5">
                            Click <Plus className="w-2.5 h-2.5 inline text-[#cfc6b0]" /> on any track to set as Next.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {userQueue.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-2.5 rounded-[10px] bg-[#121316] hover:bg-[#1b1b1f] border border-[#cfc6b0]/25 flex items-center justify-between gap-3 group transition-all"
                            >
                              <div
                                onClick={() => {
                                  removeFromUserQueue(idx);
                                  playDirectTrack(item, tracks);
                                }}
                                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                              >
                                <span className="font-mono text-[10px] text-[#cfc6b0] w-4 flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="w-9 h-9 rounded-[6px] overflow-hidden bg-[#0d0e11] border border-white/5 flex-shrink-0">
                                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="truncate min-w-0 flex-1">
                                  <h5 className="font-space text-xs text-[#FAF8F5] truncate group-hover:text-[#cfc6b0] transition-colors">
                                    {item.title}
                                  </h5>
                                  <p className="font-mono text-[10px] text-[#8f918c] truncate">
                                    {item.artist}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-mono text-[10px] text-[#8f918c]">
                                  {formatTime(item.duration || 210)}
                                </span>
                                <button
                                  onClick={() => removeFromUserQueue(idx)}
                                  className="p-1 rounded text-[#8f918c] hover:text-amber-400 hover:bg-white/5 transition-colors cursor-pointer"
                                  title="Remove from queue"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: STATION STREAM CARRIER */}
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#2b2f33] font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f918c]">
                        <div className="flex items-center gap-1.5">
                          <Radio className="w-3 h-3 text-[#cfc6b0]" />
                          <span>STATION CARRIER // {currentStation?.name || 'LIVE FEED'}</span>
                        </div>
                        <span>{tracks.length} TRACKS</span>
                      </div>

                      {tracks.length === 0 ? (
                        <div className="py-12 text-center text-[#8f918c] font-mono">
                          <Music className="w-6 h-6 mx-auto mb-2 opacity-40" />
                          <p className="text-xs">Carrier stream is initializing</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {tracks.map((t, idx) => {
                            const isCurrent = idx === currentTrackIndex;
                            return (
                              <div
                                key={t.id || idx}
                                onClick={() => selectTrack(idx)}
                                className={`p-2.5 rounded-[10px] border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                                  isCurrent
                                    ? 'bg-[#1b1b1f] border-[#00f0ff]/60 shadow-md shadow-[#00f0ff]/5'
                                    : 'bg-[#121316]/80 hover:bg-[#121316] border-[#2b2f33] hover:border-[#cfc6b0]/40'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {/* Track thumbnail / Equalizer */}
                                  <div className="relative w-9 h-9 rounded-[6px] overflow-hidden bg-[#0d0e11] border border-white/5 flex-shrink-0 flex items-center justify-center">
                                    {t.thumbnail ? (
                                      <img src={t.thumbnail} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Music className="w-3.5 h-3.5 text-[#cfc6b0]" />
                                    )}
                                    {isCurrent && isPlaying && (
                                      <div className="absolute inset-0 bg-[#0d0e11]/75 flex items-center justify-center gap-0.5">
                                        <span className="w-0.5 h-2.5 bg-[#00f0ff] animate-pulse" />
                                        <span className="w-0.5 h-3.5 bg-[#cfc6b0] animate-pulse delay-75" />
                                        <span className="w-0.5 h-2 bg-[#00f0ff] animate-pulse delay-150" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Title & Artist */}
                                  <div className="truncate flex-1 min-w-0">
                                    <h4 className={`text-xs font-space truncate ${isCurrent ? 'text-[#00f0ff] font-medium' : 'text-[#FAF8F5] group-hover:text-[#cfc6b0]'}`}>
                                      {t.title}
                                    </h4>
                                    <p className="text-[10px] font-mono text-[#8f918c] truncate mt-0.5">
                                      {t.artist}
                                    </p>
                                  </div>
                                </div>

                                {/* Duration & Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[10px]">
                                  <span className="text-[#8f918c]">
                                    {formatTime(t.duration)}
                                  </span>

                                  {isCurrent ? (
                                    <span className="px-1.5 py-0.5 rounded-[4px] bg-[#00f0ff]/15 text-[#00f0ff] text-[8px] font-bold border border-[#00f0ff]/40 uppercase tracking-widest">
                                      LIVE
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlayNext(t);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#232529] text-[#8f918c] hover:text-[#FAF8F5] transition-all cursor-pointer"
                                      title="Queue as Next"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* SECTION: STATIONS CARRIER LIST */
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2b2f33] text-[10px] uppercase tracking-[0.16em] text-[#8f918c]">
                      <span>SOVEREIGN ARCHIVAL CARRIERS</span>
                      <span>{STATIONS.length} TOTAL</span>
                    </div>

                    {STATIONS.map((st, idx) => {
                      const isCurrentSt = currentStation?.id === st.id;
                      return (
                        <div
                          key={st.id}
                          onClick={() => handleSelectStation(st)}
                          className={`p-3 rounded-[10px] border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                            isCurrentSt
                              ? 'bg-[#1b1b1f] border-[#cfc6b0] shadow-md'
                              : 'bg-[#121316] hover:bg-[#1b1b1f] border-[#2b2f33] hover:border-[#cfc6b0]/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-[6px] flex items-center justify-center text-[#FAF8F5] border border-white/10 flex-shrink-0 bg-[#0d0e11]">
                              <Radio className="w-4 h-4 text-[#cfc6b0]" />
                            </div>
                            <div className="truncate flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-[#8f918c]">#{String(idx + 1).padStart(2, '0')}</span>
                                <h4 className="text-xs font-space font-medium text-[#FAF8F5] group-hover:text-[#cfc6b0] truncate">
                                  {st.name}
                                </h4>
                              </div>
                              <p className="text-[10px] text-[#8f918c] truncate mt-0.5">
                                {st.songs?.length || 0} lossless tracks // 24-bit
                              </p>
                            </div>
                          </div>

                          <div className="w-7 h-7 rounded-[6px] border border-[#2b2f33] group-hover:border-[#cfc6b0] bg-[#1b1b1f] flex items-center justify-center transition-all flex-shrink-0">
                            <Play className="w-3 h-3 fill-current text-[#cfc6b0] group-hover:text-[#FAF8F5] translate-x-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
