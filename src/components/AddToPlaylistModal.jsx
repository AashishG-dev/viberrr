import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Plus, Check, Music, Disc3, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const ACCENT_COLORS = ['#00f0ff', '#cfc6b0', '#ff007f', '#9d4edd', '#10b981', '#f59e0b'];

export default function AddToPlaylistModal({ isOpen, onClose, track }) {
  const { playlists, createPlaylist, addTrackToPlaylist, showToast } = useAudio();
  const [isCreating, setIsCreating] = useState(false);
  const [newCrateName, setNewCrateName] = useState('');
  const [newCrateDesc, setNewCrateDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState('#00f0ff');
  const [addedMap, setAddedMap] = useState({});

  if (!isOpen || !track) return null;

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (!newCrateName.trim()) return;

    const newCrate = createPlaylist(newCrateName, newCrateDesc, selectedColor);
    if (newCrate) {
      addTrackToPlaylist(newCrate.id, track);
      setAddedMap((prev) => ({ ...prev, [newCrate.id]: true }));
      if (showToast) {
        showToast(`Created & Added to "${newCrate.name}"`);
      }
      setNewCrateName('');
      setNewCrateDesc('');
      setIsCreating(false);
    }
  };

  const handleToggleAdd = (crate) => {
    const success = addTrackToPlaylist(crate.id, track);
    if (success) {
      setAddedMap((prev) => ({ ...prev, [crate.id]: true }));
      if (showToast) {
        showToast(`Added to "${crate.name}"`);
      }
    } else {
      if (showToast) {
        showToast(`Already in "${crate.name}"`);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-[16px] bg-[#121316] border border-[#cfc6b0]/30 shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col z-10 font-mono text-[#FAF8F5]"
        >
          {/* CAD Wireframe Crosshairs */}
          <span className="cad-corner cad-tl" />
          <span className="cad-corner cad-tr" />
          <span className="cad-corner cad-bl" />
          <span className="cad-corner cad-br" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2b2f33] mb-4">
            <div className="flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-[#00f0ff] animate-spin" style={{ animationDuration: '8s' }} />
              <h2 className="font-space text-base font-semibold text-[#FAF8F5]">
                Add to Audio Crate
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-[6px] border border-[#2b2f33] hover:border-[#cfc6b0]/50 text-[#8f918c] hover:text-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Target Track Preview */}
          <div className="p-3 rounded-[10px] bg-[#0d0e12] border border-[#262832] flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[#15161a] flex-shrink-0 border border-white/10">
              <img
                src={track.thumbnail || '/viberr-icon.svg'}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-space font-medium text-[#FAF8F5] truncate">
                {track.title}
              </div>
              <div className="text-[10px] text-[#8f918c] truncate">
                {track.artist || 'Viberr Artist'}
              </div>
            </div>
          </div>

          {/* Playlists List */}
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scroll pr-1 mb-4">
            {playlists.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8f918c]">
                No custom crates created yet.
              </div>
            ) : (
              playlists.map((crate) => {
                const isAlreadyIn =
                  addedMap[crate.id] ||
                  crate.tracks.some((t) => (t.id && t.id === track.id) || t.title === track.title);

                return (
                  <button
                    key={crate.id}
                    onClick={() => handleToggleAdd(crate)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-left transition-all border cursor-pointer ${
                      isAlreadyIn
                        ? 'bg-[#1a202c]/60 border-[#00f0ff]/40 text-[#00f0ff]'
                        : 'bg-[#17181d] hover:bg-[#202229] border-[#2b2f33] text-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: crate.color || '#00f0ff' }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{crate.name}</div>
                        <div className="text-[9px] text-[#8f918c] tracking-wider">
                          {crate.tracks.length} {crate.tracks.length === 1 ? 'TRACK' : 'TRACKS'}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isAlreadyIn ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00f0ff]">
                          <Check className="w-3 h-3" /> ADDED
                        </span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#8f918c] hover:text-[#FAF8F5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Inline Create Crate Toggle */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 rounded-[8px] border border-dashed border-[#cfc6b0]/40 hover:border-[#cfc6b0] text-xs text-[#cfc6b0] hover:text-[#FAF8F5] transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#14161a]"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>CREATE NEW CRATE</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className="p-3 rounded-[10px] bg-[#17181e] border border-[#2b2f33] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#cfc6b0] font-semibold">
                  NEW ARCHIVAL CRATE
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-[10px] text-[#8f918c] hover:text-[#FAF8F5]"
                >
                  CANCEL
                </button>
              </div>

              <input
                type="text"
                placeholder="Crate Name (e.g. Late Night Drives)..."
                value={newCrateName}
                onChange={(e) => setNewCrateName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-[6px] bg-[#0d0e12] border border-[#2b2f33] text-xs text-[#FAF8F5] placeholder-[#8f918c] focus:outline-none focus:border-[#00f0ff]"
                autoFocus
              />

              <input
                type="text"
                placeholder="Description (optional)..."
                value={newCrateDesc}
                onChange={(e) => setNewCrateDesc(e.target.value)}
                className="w-full px-3 py-1.5 rounded-[6px] bg-[#0d0e12] border border-[#2b2f33] text-[11px] text-[#FAF8F5] placeholder-[#8f918c] focus:outline-none focus:border-[#00f0ff]"
              />

              {/* Accent Color Palette */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {ACCENT_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        selectedColor === col ? 'scale-125 ring-2 ring-white/50' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!newCrateName.trim()}
                  className="wireframe-btn-accent !py-1 !px-3 text-[10px] disabled:opacity-40"
                >
                  SAVE & ADD
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
