import React, { useState, useMemo } from 'react';
import { 
  Heart, Music, Play, Pause, Trash2, Clock, Sparkles, FolderPlus, 
  Share2, Download, Upload, Plus, Search, Shuffle, ArrowLeft, 
  Disc3, Copy, Check, ShieldCheck, Radio, Terminal, FileJson, AlertCircle
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/formatters';
import SiteFooter from '../components/SiteFooter';

const TABS = [
  { id: 'vault', label: '★ MY VAULT', desc: 'Saved Wishlist Tracks' },
  { id: 'crates', label: '◈ CUSTOM CRATES', desc: 'Curated Mixtapes & Playlists' },
  { id: 'history', label: '⟲ RECENT TRANSMISSIONS', desc: 'Automatic 30-Track Log' },
  { id: 'backup', label: '💾 ARCHIVE BACKUP & SYNC', desc: 'Export / Restore JSON & Sync' }
];

export default function LibraryPage() {
  const {
    nodeId,
    vaultTracks,
    toggleLike,
    playlists,
    createPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    history,
    clearHistory,
    generateShareUrl,
    exportFullArchive,
    importFullArchive,
    openAddToPlaylist,
    playDirectTrack,
    setStationTracks,
    currentTrack,
    isPlaying,
    togglePlay,
    showToast
  } = useAudio();

  const [activeTab, setActiveTab] = useState('vault');
  const [vaultSearch, setVaultSearch] = useState('');
  const [selectedCrateId, setSelectedCrateId] = useState(null);
  const [isCreatingCrate, setIsCreatingCrate] = useState(false);
  const [newCrateName, setNewCrateName] = useState('');
  const [newCrateDesc, setNewCrateDesc] = useState('');
  const [copiedCrateId, setCopiedCrateId] = useState(null);

  // Filtered Vault Tracks
  const filteredVault = useMemo(() => {
    if (!vaultSearch.trim()) return vaultTracks;
    const q = vaultSearch.toLowerCase();
    return vaultTracks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.artist?.toLowerCase().includes(q)
    );
  }, [vaultTracks, vaultSearch]);

  // Selected Crate
  const selectedCrate = useMemo(() => {
    return playlists.find((p) => p.id === selectedCrateId) || null;
  }, [playlists, selectedCrateId]);

  // Calculate total airtime of vault
  const vaultTotalSeconds = useMemo(() => {
    return vaultTracks.reduce((acc, t) => acc + (t.duration || 210), 0);
  }, [vaultTracks]);

  const handlePlayAllVault = (shuffle = false) => {
    if (vaultTracks.length === 0) return;
    const tracksToPlay = shuffle
      ? [...vaultTracks].sort(() => Math.random() - 0.5)
      : vaultTracks;
    setStationTracks(tracksToPlay, false);
    playDirectTrack(tracksToPlay[0]);
    showToast(shuffle ? 'Shuffled & Playing Vault' : 'Playing All Vault Tracks');
  };

  const handlePlayCrate = (crate, shuffle = false) => {
    if (!crate || crate.tracks.length === 0) return;
    const tracksToPlay = shuffle
      ? [...crate.tracks].sort(() => Math.random() - 0.5)
      : crate.tracks;
    setStationTracks(tracksToPlay, false);
    playDirectTrack(tracksToPlay[0]);
    showToast(shuffle ? `Shuffled "${crate.name}"` : `Playing "${crate.name}"`);
  };

  const handleShareCrate = (crate, e) => {
    if (e) e.stopPropagation();
    const url = generateShareUrl(crate);
    if (!url) {
      showToast('Crate needs at least 1 track to share');
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedCrateId(crate.id);
      showToast(`Shareable Link Copied for "${crate.name}"!`);
      setTimeout(() => setCopiedCrateId(null), 3000);
    } else {
      showToast('Link created: ' + url.slice(0, 40) + '...');
    }
  };

  const handleCreateCrateSubmit = (e) => {
    e.preventDefault();
    if (!newCrateName.trim()) return;
    const created = createPlaylist(newCrateName, newCrateDesc);
    if (created) {
      showToast(`Created Crate "${created.name}"`);
      setNewCrateName('');
      setNewCrateDesc('');
      setIsCreatingCrate(false);
      setSelectedCrateId(created.id);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importFullArchive(content);
        if (success) {
          showToast('Archive Successfully Restored & Merged!');
        } else {
          showToast('Invalid Archive JSON Format');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0e11] text-[#FAF8F5] pt-24 sm:pt-28 pb-36 px-4 sm:px-8 flex flex-col items-center select-none font-mono">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1720px] mx-auto flex flex-col">

        {/* Top Observatory Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-[#2b2f33]/60 text-[10px] tracking-[0.16em] uppercase text-[#8f918c]">
          <div className="flex items-center gap-2 text-[#cfc6b0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            <span>ARCHIVE // SOVEREIGN AUDIO MATRIX</span>
          </div>

          <div className="flex items-center gap-4 text-[#cfc6b0]/90">
            <span>CLIENT NODE: <span className="text-[#00f0ff] font-semibold">{nodeId}</span></span>
            <span className="text-[#2b2f33]">|</span>
            <span className="text-[#8f918c] hidden sm:inline">ZERO-AUTH LOCAL HARNESS</span>
          </div>
        </div>

        {/* Editorial Main Header */}
        <header className="mb-8 pb-6 border-b border-[#2b2f33]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#171920] border border-[#cfc6b0]/30 text-[#00f0ff] text-[10px] tracking-widest uppercase mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PRIVATE ENCRYPTED REPERTORY</span>
              </div>
              <h1 className="font-space text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#FAF8F5] tracking-tight">
                Studio Archive & Crates
              </h1>
              <p className="font-mono text-[#9ca0a8] text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Personalized listening station. Curate custom audio crates, bookmark lossless recordings, and share playlists across devices without accounts.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="p-3 rounded-[10px] bg-[#121316] border border-[#2b2f33] flex flex-col">
                <span className="text-[9px] text-[#8f918c] tracking-wider">SAVED VAULT</span>
                <span className="text-base font-semibold text-[#FAF8F5]">{vaultTracks.length} TRACKS</span>
              </div>
              <div className="p-3 rounded-[10px] bg-[#121316] border border-[#2b2f33] flex flex-col">
                <span className="text-[9px] text-[#8f918c] tracking-wider">CUSTOM CRATES</span>
                <span className="text-base font-semibold text-[#00f0ff]">{playlists.length} CRATES</span>
              </div>
              <div className="p-3 rounded-[10px] bg-[#121316] border border-[#2b2f33] flex flex-col">
                <span className="text-[9px] text-[#8f918c] tracking-wider">TOTAL AIRTIME</span>
                <span className="text-base font-semibold text-[#cfc6b0]">
                  {Math.floor(vaultTotalSeconds / 60)}m {vaultTotalSeconds % 60}s
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Monospaced Navigation Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-[#2b2f33]/40">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'crates') setSelectedCrateId(null);
                }}
                className={`px-4 py-2 rounded-[8px] font-mono text-xs uppercase tracking-[0.14em] transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#232529] text-[#FAF8F5] border-[#cfc6b0]/70 font-semibold shadow-sm'
                    : 'bg-[#121316] hover:bg-[#1b1b1f] text-[#8f918c] hover:text-[#FAF8F5] border-[#2b2f33]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'vault' && (
                  <span className="text-[10px] text-[#00f0ff] font-bold">({vaultTracks.length})</span>
                )}
                {tab.id === 'crates' && (
                  <span className="text-[10px] text-[#cfc6b0] font-bold">({playlists.length})</span>
                )}
                {tab.id === 'history' && (
                  <span className="text-[10px] text-[#8f918c]">({history.length})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MY VAULT (WISHLIST / LIKED TRACKS) */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            {/* Vault Action & Search Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[14px] bg-[#121316] border border-[#2b2f33]">
              {/* Search input */}
              <div className="relative flex items-center w-full sm:max-w-md">
                <Search className="w-3.5 h-3.5 text-[#8f918c] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter vault recordings..."
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-[8px] bg-[#0d0e11] border border-[#2b2f33] text-xs text-[#FAF8F5] placeholder-[#8f918c] focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handlePlayAllVault(false)}
                  disabled={vaultTracks.length === 0}
                  className="wireframe-btn-accent !py-1.5 !px-3 text-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY ALL</span>
                </button>

                <button
                  onClick={() => handlePlayAllVault(true)}
                  disabled={vaultTracks.length === 0}
                  className="wireframe-btn !py-1.5 !px-3 text-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>SHUFFLE</span>
                </button>
              </div>
            </div>

            {/* Vault Tracks List */}
            {filteredVault.length === 0 ? (
              <div className="py-20 text-center rounded-[16px] bg-[#121316]/60 border border-dashed border-[#2b2f33] p-6">
                <Heart className="w-10 h-10 mx-auto text-[#8f918c] mb-3 opacity-30" />
                <h3 className="font-space text-base text-[#FAF8F5]">Your Vault Wishlist is Empty</h3>
                <p className="text-xs text-[#8f918c] mt-1 max-w-md mx-auto leading-relaxed">
                  Click the heart icon on the Master Deck or any song in the Radar to save it here locally without accounts.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredVault.map((track, idx) => {
                  const isCurrent = currentTrack?.title === track.title && isPlaying;

                  return (
                    <div
                      key={track.id || idx}
                      onClick={() => playDirectTrack(track)}
                      className={`group flex items-center justify-between p-3 sm:p-3.5 rounded-[12px] bg-[#14151a] hover:bg-[#1b1c24] border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#00f0ff] bg-[#181a24] shadow-[0_0_16px_rgba(0,240,255,0.15)]'
                          : 'border-[#262832] hover:border-[#cfc6b0]/50'
                      }`}
                    >
                      {/* Left: Thumbnail & Titles */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                        <span className="font-mono text-xs text-[#8f918c] w-6 text-center flex-shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        <div className="relative w-11 h-11 rounded-[8px] overflow-hidden bg-[#0a0b0e] flex-shrink-0 border border-white/10 shadow-sm">
                          <img
                            src={track.thumbnail || '/viberr-icon.svg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {isCurrent ? (
                              <Pause className="w-4 h-4 text-[#00f0ff] fill-current" />
                            ) : (
                              <Play className="w-4 h-4 text-[#FAF8F5] fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="truncate flex-1">
                          <div className={`font-space text-xs sm:text-sm font-medium truncate ${isCurrent ? 'text-[#00f0ff]' : 'text-[#FAF8F5]'}`}>
                            {track.title}
                          </div>
                          <div className="text-[10px] text-[#8f918c] truncate mt-0.5">
                            {track.artist || 'Viberr Artist'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Technical Badges & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="hidden sm:inline-block text-[9px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded-[4px] border border-[#00f0ff]/20">
                          {track.isYouTubeEngine ? 'YT ENGINE' : 'FLAC 24-BIT'}
                        </span>

                        <span className="text-[10px] text-[#8f918c] w-12 text-right">
                          {formatTime(track.duration || 210)}
                        </span>

                        {/* Add to Crate */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddToPlaylist(track);
                          }}
                          className="p-1.5 rounded-[6px] border border-[#2b2f33] hover:border-[#cfc6b0] text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                          title="Add to Crate..."
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove from Vault */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                            showToast(`Removed "${track.title}" from Vault`);
                          }}
                          className="p-1.5 rounded-[6px] border border-[#2b2f33] hover:border-red-500/50 text-[#8f918c] hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove from Vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOM CRATES (PLAYLISTS) */}
        {activeTab === 'crates' && (
          <div>
            {/* View A: Detail of Selected Crate */}
            {selectedCrate ? (
              <div className="space-y-6">
                {/* Back to Crates Bar */}
                <button
                  onClick={() => setSelectedCrateId(null)}
                  className="inline-flex items-center gap-2 text-xs text-[#8f918c] hover:text-[#FAF8F5] cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>RETURN TO ALL CRATES</span>
                </button>

                {/* Crate Header Card */}
                <div className="p-6 rounded-[16px] bg-[#121316] border border-[#2b2f33] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative">
                  <span className="cad-corner cad-tl" />
                  <span className="cad-corner cad-tr" />
                  <span className="cad-corner cad-bl" />
                  <span className="cad-corner cad-br" />

                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10"
                      style={{ backgroundColor: selectedCrate.color || '#00f0ff' }}
                    >
                      <Disc3 className="w-8 h-8 text-[#0d0e11] animate-spin" style={{ animationDuration: '8s' }} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase tracking-wider text-[#cfc6b0] font-semibold">
                          CUSTOM CARRIER CRATE
                        </span>
                        <span className="text-[9px] text-[#8f918c]">#{selectedCrate.id.slice(0, 10)}</span>
                      </div>
                      <h2 className="font-space text-2xl sm:text-3xl font-semibold text-[#FAF8F5]">
                        {selectedCrate.name}
                      </h2>
                      <p className="text-xs text-[#8f918c] mt-1">
                        {selectedCrate.description || 'Personal curated audio frequency.'}
                      </p>
                      <div className="text-[10px] text-[#cfc6b0] font-mono mt-2">
                        {selectedCrate.tracks.length} RECORDINGS • {selectedCrate.tracks.reduce((acc, t) => acc + (t.duration || 210), 0)}s AIRTIME
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handlePlayCrate(selectedCrate, false)}
                      disabled={selectedCrate.tracks.length === 0}
                      className="wireframe-btn-accent !py-2 !px-4 text-xs flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>PLAY CRATE</span>
                    </button>

                    <button
                      onClick={() => handlePlayCrate(selectedCrate, true)}
                      disabled={selectedCrate.tracks.length === 0}
                      className="wireframe-btn !py-2 !px-3 text-xs flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleShareCrate(selectedCrate, e)}
                      disabled={selectedCrate.tracks.length === 0}
                      className="wireframe-btn !py-2 !px-3 text-xs flex items-center gap-1.5 text-[#00f0ff] disabled:opacity-40"
                      title="Generate zero-backend shareable link"
                    >
                      {copiedCrateId === selectedCrate.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00f0ff]" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>SHARE</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete crate "${selectedCrate.name}"?`)) {
                          deletePlaylist(selectedCrate.id);
                          setSelectedCrateId(null);
                          showToast('Crate Deleted');
                        }
                      }}
                      className="p-2 rounded-[8px] border border-[#2b2f33] hover:border-red-500/50 text-[#8f918c] hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Crate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tracks Inside Crate */}
                {selectedCrate.tracks.length === 0 ? (
                  <div className="py-16 text-center rounded-[14px] bg-[#121316] border border-dashed border-[#2b2f33] p-6">
                    <Music className="w-8 h-8 mx-auto text-[#8f918c] mb-2 opacity-30" />
                    <h4 className="text-sm font-space text-[#FAF8F5]">Crate is Empty</h4>
                    <p className="text-xs text-[#8f918c] mt-1 max-w-sm mx-auto">
                      Add songs to this crate by clicking "+ CRATE" on any track in your Vault, the Radar, or Search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCrate.tracks.map((track, idx) => {
                      const isCurrent = currentTrack?.title === track.title && isPlaying;
                      return (
                        <div
                          key={track.id || idx}
                          onClick={() => playDirectTrack(track)}
                          className={`group flex items-center justify-between p-3 rounded-[12px] bg-[#14151a] hover:bg-[#1b1c24] border transition-all cursor-pointer ${
                            isCurrent
                              ? 'border-[#00f0ff] bg-[#181a24]'
                              : 'border-[#262832] hover:border-[#cfc6b0]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                            <span className="font-mono text-xs text-[#8f918c] w-6 text-center flex-shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div className="relative w-10 h-10 rounded-[6px] overflow-hidden bg-[#0d0e12] flex-shrink-0 border border-white/10">
                              <img src={track.thumbnail || '/viberr-icon.svg'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="truncate flex-1">
                              <div className={`font-space text-xs sm:text-sm font-medium truncate ${isCurrent ? 'text-[#00f0ff]' : 'text-[#FAF8F5]'}`}>
                                {track.title}
                              </div>
                              <div className="text-[10px] text-[#8f918c] truncate">
                                {track.artist || 'Viberr Artist'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[10px] text-[#8f918c] w-12 text-right">
                              {formatTime(track.duration || 210)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrackFromPlaylist(selectedCrate.id, track.id);
                                showToast(`Removed from "${selectedCrate.name}"`);
                              }}
                              className="p-1.5 rounded-[6px] border border-[#2b2f33] hover:border-red-500/50 text-[#8f918c] hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove from Crate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* View B: All Crates Grid */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-space text-lg font-semibold text-[#FAF8F5]">
                      Personal Audio Crates
                    </h3>
                    <p className="text-xs text-[#8f918c] mt-0.5">
                      Curate themed playlists and generate instant URL sharing links for friends.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsCreatingCrate(true)}
                    className="wireframe-btn-accent !py-2 !px-4 text-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>CREATE NEW CRATE</span>
                  </button>
                </div>

                {/* Create Crate Modal Form */}
                {isCreatingCrate && (
                  <form onSubmit={handleCreateCrateSubmit} className="p-5 rounded-[14px] bg-[#14161f] border border-[#00f0ff]/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#00f0ff] uppercase tracking-wider">
                        NEW CRATE ARCHIVE
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCrate(false)}
                        className="text-xs text-[#8f918c] hover:text-[#FAF8F5]"
                      >
                        CANCEL
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Crate Name (e.g. Midnight Phonk Drive)..."
                        value={newCrateName}
                        onChange={(e) => setNewCrateName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-[8px] bg-[#0d0e12] border border-[#2b2f33] text-xs text-[#FAF8F5] placeholder-[#8f918c] focus:outline-none focus:border-[#00f0ff]"
                        autoFocus
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)..."
                        value={newCrateDesc}
                        onChange={(e) => setNewCrateDesc(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-[8px] bg-[#0d0e12] border border-[#2b2f33] text-xs text-[#FAF8F5] placeholder-[#8f918c] focus:outline-none focus:border-[#00f0ff]"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={!newCrateName.trim()}
                        className="wireframe-btn-accent !py-1.5 !px-4 text-xs disabled:opacity-40"
                      >
                        SAVE CRATE
                      </button>
                    </div>
                  </form>
                )}

                {/* Crates Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 trend-adaptive-grid gap-4 sm:gap-6">
                  {playlists.map((crate) => {
                    const trackCount = crate.tracks?.length || 0;
                    return (
                      <div
                        key={crate.id}
                        onClick={() => setSelectedCrateId(crate.id)}
                        className="group flex flex-col justify-between p-5 rounded-[16px] bg-[#121316] hover:bg-[#181920] border border-[#cfc6b0]/25 hover:border-[#cfc6b0]/60 transition-all cursor-pointer shadow-lg relative"
                      >
                        <div>
                          {/* Colored Disc Preview */}
                          <div
                            className="aspect-square w-full rounded-[12px] mb-4 flex items-center justify-center relative overflow-hidden border border-white/10 shadow-inner"
                            style={{ backgroundColor: crate.color || '#00f0ff' }}
                          >
                            <Disc3 className="w-16 h-16 text-[#0d0e11] group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[4px] bg-black/75 backdrop-blur-md text-[9px] text-[#FAF8F5] font-mono border border-white/15">
                              {trackCount} {trackCount === 1 ? 'TRACK' : 'TRACKS'}
                            </div>
                          </div>

                          <h4 className="font-space text-base font-semibold text-[#FAF8F5] truncate group-hover:text-[#00f0ff] transition-colors">
                            {crate.name}
                          </h4>
                          <p className="text-xs text-[#8f918c] line-clamp-2 mt-1 mb-3">
                            {crate.description || 'Personal audio archive.'}
                          </p>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="pt-3 border-t border-[#262832] flex items-center justify-between font-mono text-[10px]">
                          <span className="text-[#8f918c]">OPEN CRATE →</span>
                          <button
                            onClick={(e) => handleShareCrate(crate, e)}
                            disabled={trackCount === 0}
                            className="p-1 rounded-[6px] text-[#00f0ff] hover:text-[#FAF8F5] transition-colors cursor-pointer disabled:opacity-30"
                            title="Copy Shareable Link"
                          >
                            {copiedCrateId === crate.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RECENT TRANSMISSIONS (LISTENING HISTORY) */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[14px] bg-[#121316] border border-[#2b2f33]">
              <div>
                <h3 className="font-space text-sm font-semibold text-[#FAF8F5]">
                  Recent Transmissions Log
                </h3>
                <p className="text-xs text-[#8f918c] mt-0.5">
                  Rolling ledger of your last 30 played songs. Replay or add to crates anytime.
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear your listening history?')) {
                      clearHistory();
                      showToast('Listening History Cleared');
                    }
                  }}
                  className="wireframe-btn !py-1.5 !px-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CLEAR LOG</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-20 text-center rounded-[16px] bg-[#121316]/60 border border-dashed border-[#2b2f33] p-6">
                <Clock className="w-10 h-10 mx-auto text-[#8f918c] mb-3 opacity-30" />
                <h3 className="font-space text-base text-[#FAF8F5]">No Transmissions Logged Yet</h3>
                <p className="text-xs text-[#8f918c] mt-1 max-w-sm mx-auto">
                  Songs you play from radio stations, search, or crates will be recorded here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((track, idx) => {
                  const isCurrent = currentTrack?.title === track.title && isPlaying;
                  return (
                    <div
                      key={idx}
                      onClick={() => playDirectTrack(track)}
                      className={`group flex items-center justify-between p-3 rounded-[12px] bg-[#14151a] hover:bg-[#1b1c24] border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#00f0ff] bg-[#181a24]'
                          : 'border-[#262832] hover:border-[#cfc6b0]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                        <span className="font-mono text-xs text-[#8f918c] w-6 text-center flex-shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="relative w-10 h-10 rounded-[6px] overflow-hidden bg-[#0d0e12] flex-shrink-0 border border-white/10">
                          <img src={track.thumbnail || '/viberr-icon.svg'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate flex-1">
                          <div className={`font-space text-xs sm:text-sm font-medium truncate ${isCurrent ? 'text-[#00f0ff]' : 'text-[#FAF8F5]'}`}>
                            {track.title}
                          </div>
                          <div className="text-[10px] text-[#8f918c] truncate">
                            {track.artist || 'Viberr Artist'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddToPlaylist(track);
                          }}
                          className="p-1.5 rounded-[6px] border border-[#2b2f33] hover:border-[#cfc6b0] text-[#8f918c] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                          title="Add to Crate..."
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ARCHIVE BACKUP & SYNC (ZERO-AUTH DATA FREEDOM) */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup Card */}
              <div className="p-6 rounded-[16px] bg-[#121316] border border-[#2b2f33] flex flex-col justify-between gap-5 relative">
                <span className="cad-corner cad-tl" />
                <span className="cad-corner cad-tr" />
                <span className="cad-corner cad-bl" />
                <span className="cad-corner cad-br" />

                <div>
                  <div className="flex items-center gap-2 text-[#00f0ff] text-xs font-semibold uppercase tracking-wider mb-2">
                    <Download className="w-4 h-4" />
                    <span>EXPORT ARCHIVE (.JSON)</span>
                  </div>
                  <h3 className="font-space text-xl font-semibold text-[#FAF8F5]">
                    Download Complete Vault Backup
                  </h3>
                  <p className="text-xs text-[#8f918c] mt-2 leading-relaxed">
                    Download all your favorited wishlist songs, custom playlists, and listening history into a portable encrypted `.json` file. Keep your library forever without relying on database accounts.
                  </p>
                </div>

                <button
                  onClick={exportFullArchive}
                  className="wireframe-btn-accent !py-2.5 !px-4 text-xs flex items-center justify-center gap-2 cursor-pointer w-full"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT ARCHIVE (.JSON)</span>
                </button>
              </div>

              {/* Restore Card */}
              <div className="p-6 rounded-[16px] bg-[#121316] border border-[#2b2f33] flex flex-col justify-between gap-5 relative">
                <span className="cad-corner cad-tl" />
                <span className="cad-corner cad-tr" />
                <span className="cad-corner cad-bl" />
                <span className="cad-corner cad-br" />

                <div>
                  <div className="flex items-center gap-2 text-[#cfc6b0] text-xs font-semibold uppercase tracking-wider mb-2">
                    <Upload className="w-4 h-4" />
                    <span>RESTORE ARCHIVE (.JSON)</span>
                  </div>
                  <h3 className="font-space text-xl font-semibold text-[#FAF8F5]">
                    Restore or Merge from File
                  </h3>
                  <p className="text-xs text-[#8f918c] mt-2 leading-relaxed">
                    Switching phones or moved to a new browser? Upload your backup file to instantly merge your playlists and wishlist without losing anything.
                  </p>
                </div>

                <label className="wireframe-btn !py-2.5 !px-4 text-xs flex items-center justify-center gap-2 cursor-pointer w-full text-center">
                  <Upload className="w-4 h-4" />
                  <span>SELECT BACKUP FILE</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Explanatory Guide Box */}
            <div className="p-5 rounded-[14px] bg-[#14161f] border border-[#2b2f33] flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#00f0ff] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-space text-sm font-semibold text-[#FAF8F5]">
                  How Zero-Auth Storage & Sharing Works
                </h4>
                <p className="text-xs text-[#8f918c] mt-1 leading-relaxed">
                  Viberr uses client-side local sandboxing with base64 state hydration. Your music taste, custom crates, and listening patterns stay private on your hardware. When sharing a crate, the track codes are compressed directly into the share URL—your friends can open, play, and clone the crate into their own browser with 1 click without either of you needing to log in.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
      <SiteFooter />
    </div>
  );
}
