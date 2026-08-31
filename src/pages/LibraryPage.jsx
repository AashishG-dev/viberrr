import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Music, Play, Trash2, Clock, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { STATIONS } from '../data/stationsData';
import { isTrackLiked, toggleTrackLike, formatTime } from '../utils/formatters';

export default function LibraryPage() {
  const { playDirectTrack } = useAudio();
  const [likedTracks, setLikedTracks] = useState([]);

  useEffect(() => {
    // Collect all tracks that are liked from localStorage
    const allTracks = [];
    for (const station of STATIONS) {
      if (station.songs) {
        for (const song of station.songs) {
          if (isTrackLiked(song.id)) {
            allTracks.push({
              ...song,
              stationName: station.name,
              stationColor: station.color
            });
          }
        }
      }
    }
    setLikedTracks(allTracks);
  }, []);

  const handleRemoveLiked = (e, trackId) => {
    e.stopPropagation();
    toggleTrackLike(trackId);
    setLikedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-3 sm:px-8 py-6 pb-28 custom-scroll max-w-[1720px] mx-auto text-white">
      {/* Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden glass-panel-neon border border-white/20 bg-gradient-to-r from-red-950/50 via-purple-950/40 to-black/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-mono mb-3">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>SAVED COLLECTION</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-syne text-white tracking-tight leading-tight">
            Your Music Library
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-space mt-2 leading-relaxed">
            All your favorited lossless tracks, Spotify discoveries, and curated playlists in one dedicated hub.
          </p>
        </div>
      </div>

      {/* Liked Tracks Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono text-white/60">
          <span>{likedTracks.length} FAVORITED TRACKS</span>
        </div>
      </div>

      {/* Tracks List */}
      {likedTracks.length === 0 ? (
        <div className="py-24 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
          <Heart className="w-12 h-12 mx-auto text-white/20 mb-3" />
          <h3 className="text-base font-bold font-syne text-white/80">No Liked Tracks Yet</h3>
          <p className="text-xs text-white/40 font-space mt-1">
            Click the heart icon on any playing track or playlist item to add it to your library.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {likedTracks.map((track, idx) => (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.005 }}
              onClick={() => playDirectTrack(track)}
              className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xs font-mono text-white/40 w-5 text-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  {track.thumbnail ? (
                    <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className="truncate flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold font-syne text-white truncate group-hover:text-cyan-300">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-white/50 font-space truncate mt-0.5">
                    {track.artist} • <span className="text-white/40">{track.stationName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-mono text-white/40">
                  {formatTime(track.duration)}
                </span>
                <button
                  onClick={(e) => handleRemoveLiked(e, track.id)}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="Remove from Library"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 group-hover:bg-cyan-400 group-hover:text-black text-cyan-300 flex items-center justify-center transition-all">
                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
