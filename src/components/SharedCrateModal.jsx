import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, X, Disc3, Music, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function SharedCrateModal() {
  const { decodeShareUrl, createPlaylist, addTrackToPlaylist, playDirectTrack, showToast } = useAudio();
  const [incomingCrate, setIncomingCrate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('share_crate');
    if (encoded) {
      const decoded = decodeShareUrl(encoded);
      if (decoded && decoded.tracks && decoded.tracks.length > 0) {
        setIncomingCrate(decoded);
        setIsOpen(true);
      }
    }
  }, [decodeShareUrl]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove query param from URL cleanly
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.delete('share_crate');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };

  const handleImport = () => {
    if (!incomingCrate) return;
    const newCrate = createPlaylist(
      incomingCrate.name || 'Imported Shared Crate',
      incomingCrate.description,
      incomingCrate.color || '#00f0ff'
    );

    if (newCrate) {
      incomingCrate.tracks.forEach((track) => {
        addTrackToPlaylist(newCrate.id, track);
      });
      if (showToast) {
        showToast(`Imported "${incomingCrate.name}" to your Crates!`);
      }
    }
    handleClose();
  };

  const handlePlayAll = () => {
    if (!incomingCrate || incomingCrate.tracks.length === 0) return;
    // Auto import and play first track
    handleImport();
    playDirectTrack(incomingCrate.tracks[0]);
  };

  if (!isOpen || !incomingCrate) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-[16px] bg-[#121316] border border-[#00f0ff]/40 shadow-2xl p-6 overflow-hidden flex flex-col z-10 font-mono text-[#FAF8F5]"
        >
          {/* CAD Crosshairs */}
          <span className="cad-corner cad-tl !border-[#00f0ff]" />
          <span className="cad-corner cad-tr !border-[#00f0ff]" />
          <span className="cad-corner cad-bl !border-[#00f0ff]" />
          <span className="cad-corner cad-br !border-[#00f0ff]" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2b2f33] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#00f0ff] font-semibold">
                INCOMING CARRIER CRATE DISCOVERED
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-[6px] border border-[#2b2f33] hover:border-[#cfc6b0]/50 text-[#8f918c] hover:text-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Crate Information Card */}
          <div className="p-4 rounded-[12px] bg-[#181920] border border-[#2b2f33] mb-4 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10"
              style={{ backgroundColor: incomingCrate.color || '#00f0ff' }}
            >
              <Disc3 className="w-7 h-7 text-[#0d0e11] animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <div className="truncate flex-1">
              <h3 className="font-space text-base font-semibold text-[#FAF8F5] truncate">
                {incomingCrate.name}
              </h3>
              <p className="text-xs text-[#8f918c] truncate mt-0.5">
                {incomingCrate.description || 'Shared Curated Frequency'}
              </p>
              <div className="text-[10px] text-[#cfc6b0] mt-1 font-semibold">
                {incomingCrate.tracks.length} LOSSLESS RECORDINGS
              </div>
            </div>
          </div>

          {/* Track List Preview */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scroll pr-1 mb-5">
            {incomingCrate.tracks.map((track, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-[6px] bg-[#16171d] border border-[#262830] text-xs"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span className="text-[10px] text-[#8f918c] w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="font-medium text-[#FAF8F5] truncate block">
                      {track.title}
                    </span>
                    <span className="text-[10px] text-[#8f918c] truncate block">
                      {track.artist || 'Viberr Radio'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-[#00f0ff] uppercase tracking-wider flex-shrink-0">
                  {track.isYouTubeEngine ? 'YT ENGINE' : 'FLAC'}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="wireframe-btn-accent !w-1/2 justify-center !py-2.5 flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY & SAVE</span>
            </button>

            <button
              onClick={handleImport}
              className="wireframe-btn !w-1/2 justify-center !py-2.5 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>IMPORT CRATE</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
