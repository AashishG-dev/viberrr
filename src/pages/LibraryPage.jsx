import React, { useState, useEffect } from 'react';
import { Heart, Music, Play, Pause, Trash2, Clock, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { STATIONS } from '../data/stationsData';
import { isTrackLiked, toggleTrackLike, formatTime } from '../utils/formatters';
import SiteFooter from '../components/SiteFooter';

export default function LibraryPage() {
  const { playDirectTrack, currentTrack, isPlaying, togglePlay, showToast } = useAudio();
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
    if (showToast) {
      showToast('Track Removed from Library');
    }
  };

  const handleTrackClick = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playDirectTrack(track);
      if (showToast) {
        showToast(`Now Playing: ${track.title}`);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#121316] text-[#e3e2e6] pt-24 pb-36 px-4 sm:px-8">
      <div className="max-w-[1280px] mx-auto flex flex-col">

        {/* Editorial Header */}
        <header className="mb-10 pb-8 border-b border-[#343538]/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/60 mb-4">
            <Heart className="w-3.5 h-3.5 text-[#cfc6b0] fill-current" />
            <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest text-[10px]">
              PERSONAL VAULT ARCHIVE
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline-lg text-3xl sm:text-5xl font-serif text-[#FAF8F5] tracking-tight">
                Your Music Library
              </h1>
              <p className="font-body-md text-[#c5c7c1] text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                A private vault of favorited audio streams, custom bookmarks, and audiophile master cuts.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#8f918c]">
              <span>{likedTracks.length} FAVORITED TRACKS</span>
            </div>
          </div>
        </header>

        {/* Liked Tracks List */}
        {likedTracks.length === 0 ? (
          <div className="py-24 text-center rounded-2xl bg-[#1b1b1f] border border-[#343538]/40">
            <Heart className="w-12 h-12 mx-auto text-[#8f918c] mb-3 opacity-30" />
            <h3 className="font-headline-sm text-base text-[#FAF8F5]">Your Library is Empty</h3>
            <p className="font-body-sm text-xs text-[#8f918c] mt-1 max-w-sm mx-auto">
              Click the heart icon on any playing track, radio station, or trending hit to save it to your private vault.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {likedTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#1b1b1f] hover:bg-[#222227] border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[#cfc6b0] bg-[#1f1f23]'
                      : 'border-[#343538]/50 hover:border-[#cfc6b0]/50'
                  }`}
                >
                  {/* Left: Track Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="font-mono text-xs text-[#8f918c] w-6 text-center flex-shrink-0">
                      {idx + 1}
                    </span>

                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#0d0e11] flex-shrink-0 border border-white/5">
                      {track.thumbnail ? (
                        <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#cfc6b0]">
                          <Music className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {isCurrent ? (
                          <Pause className="w-4 h-4 text-[#FAF8F5] fill-current" />
                        ) : (
                          <Play className="w-4 h-4 text-[#FAF8F5] fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="truncate flex-1 min-w-0">
                      <h4 className="font-headline-sm text-sm text-[#FAF8F5] truncate group-hover:text-[#cfc6b0] transition-colors">
                        {track.title}
                      </h4>
                      <p className="font-body-sm text-xs text-[#c5c7c1] truncate mt-0.5">
                        {track.artist} {track.stationName && `• ${track.stationName}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Duration & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="font-mono text-xs text-[#8f918c]">
                      {formatTime(track.duration)}
                    </span>

                    <button
                      onClick={(e) => handleRemoveLiked(e, track.id)}
                      className="p-2 rounded-lg text-[#8f918c] hover:text-[#e57373] hover:bg-white/5 transition-all cursor-pointer"
                      title="Remove from Library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-[#cfc6b0] text-[#121316]'
                        : 'bg-[#292a2d] text-[#FAF8F5] group-hover:bg-[#FAF8F5] group-hover:text-[#121316]'
                    }`}>
                      {isCurrent ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Site Footer with Watermark */}
        <SiteFooter />

      </div>
    </div>
  );
}
