import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Play, Pause, RefreshCw, Radio, 
  Sparkles, Heart, Plus, Music, Layers, Volume2
} from 'lucide-react';
import { STATIONS } from '../data/stationsData';
import { useAudio } from '../context/AudioContext';
import { trendsService } from '../services/streaming/TrendsService';
import { formatTime } from '../utils/formatters';
import SiteFooter from '../components/SiteFooter';

const EXPLORE_CATEGORIES = [
  { id: 'all', code: '01', label: 'ALL', desc: 'Apex & Chart Leaders' },
  { id: 'vault', code: '★', label: 'MY VAULT', desc: 'Personal Saved Archival Cuts' },
  { id: 'spotify', code: '02', label: 'RADAR', desc: 'Spotify Spectral Streams' },
  { id: 'youtube', code: '03', label: 'AIRPLAY', desc: 'Broadcast Music Feeds' },
  { id: 'dhh', code: '04', label: 'UNDERGROUND', desc: 'Desi Hip-Hop & Raw Tapes' },
  { id: 'phonk', code: '05', label: 'DRIFT', desc: 'High-Octane Phonk & Speed' },
  { id: 'lofi', code: '06', label: 'CHILL', desc: 'Nocturnal Study & Rain' },
  { id: 'bollywood', code: '07', label: 'VINYL', desc: 'Retro Cinema Master Recordings' },
  { id: 'carriers', code: '08', label: 'CARRIERS', desc: '28 Sovereign Radio Frequencies' }
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTracks, setCategoryTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const {
    currentTrack,
    currentStation,
    isPlaying,
    playDirectTrack,
    handleSelectStation,
    togglePlay,
    showToast,
    vaultTracks,
    isLiked,
    handleToggleLike,
    handlePlayNext,
    vaultCount
  } = useAudio();

  // Dynamically load tracks whenever user switches category or types search
  const loadCategoryData = useCallback(async (cat, query, force = false) => {
    if (cat === 'carriers' || cat === 'vault') {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setIsLoading(true);
    try {
      const list = await trendsService.fetchTrends(cat, query, force);
      setCategoryTracks(list || []);
    } catch (e) {
      console.warn('Failed to load category data:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategoryData(activeCategory, searchQuery);
    }, searchQuery ? 350 : 0);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, loadCategoryData]);

  // Categories list with dynamic vault count
  const categories = useMemo(() => {
    return EXPLORE_CATEGORIES.map((c) => {
      if (c.id === 'vault') {
        return { ...c, label: `MY VAULT (${vaultCount})` };
      }
      return c;
    });
  }, [vaultCount]);

  // Filtered station carriers for 'carriers' category
  const filteredCarriers = useMemo(() => {
    if (activeCategory !== 'carriers') return [];
    if (!searchQuery.trim()) return STATIONS;
    const q = searchQuery.toLowerCase().trim();
    return STATIONS.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.tagline?.toLowerCase().includes(q) ||
        st.description?.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  // Filtered tracks for current category
  const displayedTracks = useMemo(() => {
    if (activeCategory === 'carriers') return [];
    if (activeCategory === 'vault') {
      if (!searchQuery.trim()) return vaultTracks;
      const q = searchQuery.toLowerCase().trim();
      return vaultTracks.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.artist && t.artist.toLowerCase().includes(q))
      );
    }
    return categoryTracks;
  }, [activeCategory, vaultTracks, searchQuery, categoryTracks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCategoryData(activeCategory, searchQuery, true);
    if (showToast) {
      showToast('Category Stream Synchronized');
    }
  };

  const handleSurfTrack = () => {
    if (activeCategory === 'carriers' && filteredCarriers.length > 0) {
      const randomSt = filteredCarriers[Math.floor(Math.random() * filteredCarriers.length)];
      handleTuneInStation(randomSt);
      return;
    }

    if (displayedTracks && displayedTracks.length > 0) {
      const randomTrack = displayedTracks[Math.floor(Math.random() * displayedTracks.length)];
      if (randomTrack) {
        handleTrackClick(randomTrack);
      }
    }
  };

  const handleTrackClick = (track) => {
    const hasValidYtId = Boolean(track.videoId && /^[a-zA-Z0-9_-]{11}$/.test(track.videoId));
    const playable = {
      ...track,
      id: track.id || `explore_${Date.now()}`,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration || 210,
      url: hasValidYtId ? '' : (track.url || ''),
      videoId: hasValidYtId ? track.videoId : '',
      isYouTubeEngine: hasValidYtId,
      isFullTrack: true
    };

    playDirectTrack(playable, displayedTracks);
    if (showToast) {
      showToast(`Transmitting: ${track.title}`);
    }
  };

  const handleTuneInStation = (st) => {
    handleSelectStation(st);
    if (!isPlaying) togglePlay();
    if (showToast) {
      showToast(`Tuned into ${st.name}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0e11] text-[#FAF8F5] pt-20 pb-32 px-4 sm:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1720px] mx-auto flex flex-col relative z-10">

        {/* Editorial Header Ribbon & Title */}
        <header className="mb-8 pb-6 border-b border-[#2b2f33]">
          <div className="flex items-center justify-between gap-4 mb-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#cfc6b0]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
              <span>EXPLORE // SOVEREIGN DIRECTORY PROTOCOL</span>
            </div>
            <span className="text-[#8f918c] hidden sm:inline">24-BIT / 96 kHz LOSSLESS CARRIERS</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="display-monument text-3xl sm:text-5xl text-[#FAF8F5]">
                Explore & <span className="word-tracer">Frequencies</span>
              </h1>
              <p className="font-mono text-xs text-[#8f918c] mt-2 max-w-2xl leading-relaxed">
                Browse category-wise live streams, personal archival vault, and 28 sovereign loss-free carriers.
              </p>
            </div>

            {/* Quick Filter Controls: Surf, Grid/List Mode, Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSurfTrack}
                className="wireframe-btn !px-3 !py-1.5"
                title="Surf to Random Song in Category"
              >
                <Sparkles className="w-3 h-3 text-[#cfc6b0]" />
                <span>SURF</span>
              </button>

              {/* View Mode Toggle: Grid vs List (Hidden in Carriers mode) */}
              {activeCategory !== 'carriers' && (
                <div className="flex items-center p-0.5 rounded-[8px] border border-[#2b2f33] bg-[#0d0e11]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 rounded-[6px] text-[10px] font-mono uppercase tracking-[0.14em] transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#232529] text-[#FAF8F5] font-semibold border border-[#cfc6b0]/30'
                        : 'text-[#8f918c] hover:text-[#FAF8F5]'
                    }`}
                  >
                    MATRIX
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1 rounded-[6px] text-[10px] font-mono uppercase tracking-[0.14em] transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-[#232529] text-[#FAF8F5] font-semibold border border-[#cfc6b0]/30'
                        : 'text-[#8f918c] hover:text-[#FAF8F5]'
                    }`}
                  >
                    INDEX
                  </button>
                </div>
              )}

              {/* Refresh Button */}
              {activeCategory !== 'carriers' && activeCategory !== 'vault' && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="wireframe-btn !px-2.5 !py-1.5"
                  title="Synchronize Feed"
                >
                  <RefreshCw className={`w-3 h-3 text-[#cfc6b0] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isRefreshing ? 'SYNC...' : 'SYNC'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative mt-6">
            <div className="relative flex items-center p-1 rounded-[10px] bg-[#121316] border border-[#2b2f33] focus-within:border-[#cfc6b0]/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-[#8f918c] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search inside ${activeCategory === 'carriers' ? '28 radio stations' : 'current category'}...`}
                  className="w-full bg-transparent border-none text-[#FAF8F5] placeholder-[#8f918c] text-xs focus:outline-none font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] font-mono text-[#8f918c] hover:text-[#FAF8F5] cursor-pointer px-2"
                  >
                    RESET
                  </button>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 border-l border-[#2b2f33]">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-[4px] bg-[#1b1b1f] text-[#cfc6b0] border border-[#2b2f33] uppercase tracking-[0.14em]">
                  DIRECT RESOLUTION
                </span>
              </div>
            </div>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-6 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-[8px] font-mono text-[10px] uppercase tracking-[0.16em] transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer border ${
                    isActive
                      ? 'bg-[#232529] text-[#FAF8F5] border-[#cfc6b0]/60 font-semibold shadow-sm'
                      : 'bg-[#121316] hover:bg-[#1b1b1f] text-[#8f918c] hover:text-[#FAF8F5] border-[#2b2f33]'
                  }`}
                >
                  <span className="text-[#cfc6b0]/60">{cat.code}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 trend-adaptive-grid gap-6 py-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="p-5 rounded-[16px] bg-[#121316] border border-[#2b2f33] animate-pulse flex flex-col gap-3">
                <div className="aspect-square w-full rounded-[10px] bg-[#1b1b1f]" />
                <div className="h-4 bg-[#1b1b1f] rounded w-3/4" />
                <div className="h-3 bg-[#1b1b1f] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* 1. CARRIERS VIEW (28 Sovereign Radio Stations) */}
        {!isLoading && activeCategory === 'carriers' && (
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#2b2f33] font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f918c]">
              <span>ALL 28 SOVEREIGN LOSSLESS FREQUENCIES</span>
              <span>{filteredCarriers.length} ACTIVE CHANNELS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 trend-adaptive-grid gap-6">
              {filteredCarriers.map((st, idx) => {
                const isCurrentSt = currentStation?.id === st.id;
                return (
                  <article
                    key={st.id}
                    onClick={() => handleTuneInStation(st)}
                    className={`group flex flex-col justify-between p-5 rounded-[16px] bg-[#121316] hover:bg-[#1b1b1f] border transition-all duration-200 cursor-pointer relative ${
                      isCurrentSt
                        ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)] bg-[#17191d]'
                        : 'border-[#cfc6b0]/20 hover:border-[#cfc6b0]/50'
                    }`}
                  >
                    {/* CAD Telemetry Tag */}
                    <div className="flex items-center justify-between mb-3 text-[9px] font-mono tracking-[0.16em] uppercase text-[#8f918c]">
                      <span className="text-[#cfc6b0]">CH {String(idx + 1).padStart(2, '0')} // CARRIER</span>
                      <span className="text-[#00f0ff]">24-BIT 96kHz</span>
                    </div>

                    <div>
                      {/* Station Art Preview */}
                      <div className="relative aspect-video w-full rounded-[10px] overflow-hidden mb-4 bg-[#0d0e11] border border-white/5">
                        <img
                          src={st.desktopBgs?.[0] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'}
                          alt={st.name}
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        />

                        {/* Quick Play Trigger */}
                        <div className="absolute inset-0 bg-[#0d0e11]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-11 h-11 rounded-[8px] border border-[#cfc6b0] bg-[#121316] text-[#FAF8F5] flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            {isCurrentSt && isPlaying ? (
                              <Pause className="w-4 h-4 fill-current text-[#00f0ff]" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5 text-[#cfc6b0]" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Station Title & Tagline */}
                      <h3 className="font-space text-sm text-[#FAF8F5] font-normal leading-snug truncate group-hover:text-[#cfc6b0] transition-colors mb-1">
                        {st.name}
                      </h3>
                      <p className="font-mono text-xs text-[#8f918c] line-clamp-2 mb-3">
                        {st.tagline || st.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-[#2b2f33] flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#8f918c]">
                        {st.songs?.length || 0} TRACKS • FLAC
                      </span>

                      <span className={`px-2.5 py-1 rounded-[6px] border text-[9px] uppercase tracking-[0.14em] transition-all ${
                        isCurrentSt
                          ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                          : 'border-[#cfc6b0]/30 text-[#FAF8F5] group-hover:border-[#cfc6b0] group-hover:text-[#cfc6b0]'
                      }`}>
                        {isCurrentSt ? 'TUNED IN' : 'TUNE IN'}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. VAULT EMPTY STATE */}
        {!isLoading && activeCategory === 'vault' && displayedTracks.length === 0 && (
          <div className="py-20 px-6 text-center font-mono border border-dashed border-[#2b2f33] rounded-[16px] bg-[#121316]/50 max-w-2xl mx-auto my-8">
            <Heart className="w-8 h-8 text-[#8f918c] mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-space text-[#FAF8F5] mb-1">Your Personal Vault is Empty</h4>
            <p className="text-xs text-[#8f918c] max-w-sm mx-auto leading-relaxed">
              Click the <Heart className="w-3 h-3 inline text-[#cfc6b0] mx-0.5" /> icon on any track or in the Master Deck to store your personal favorites locally without accounts.
            </p>
          </div>
        )}

        {/* 3. TRACKS MATRIX GRID VIEW */}
        {!isLoading && activeCategory !== 'carriers' && viewMode === 'grid' && displayedTracks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 trend-adaptive-grid gap-6">
            {displayedTracks.map((item, idx) => {
              const isCurrentlyPlaying = currentTrack?.title === item.title && isPlaying;
              const liked = isLiked(item.id || item.title);
              return (
                <article
                  key={item.id || idx}
                  onClick={() => handleTrackClick(item)}
                  className={`group flex flex-col justify-between p-5 rounded-[16px] bg-[#121316] hover:bg-[#1b1b1f] border transition-all duration-200 cursor-pointer relative ${
                    isCurrentlyPlaying
                      ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'border-[#cfc6b0]/20 hover:border-[#cfc6b0]/50'
                  }`}
                >
                  {/* CAD Telemetry Tag */}
                  <div className="flex items-center justify-between mb-3 text-[9px] font-mono tracking-[0.16em] uppercase text-[#8f918c]">
                    <span className="text-[#cfc6b0]">#{String(idx + 1).padStart(2, '0')} // NODE</span>
                    <span className="text-[#00f0ff]">FLAC 24-BIT</span>
                  </div>

                  <div>
                    {/* Artwork Preview Frame */}
                    <div className="relative aspect-square w-full rounded-[10px] overflow-hidden mb-4 bg-[#0d0e11] border border-white/5">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
                        }}
                      />

                      {/* Quick Action Buttons on Artwork */}
                      <div className="absolute inset-0 bg-[#0d0e11]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {/* Top-left: Play Next */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayNext(item);
                          }}
                          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-[6px] border border-white/15 hover:border-[#cfc6b0] bg-[#121316]/90 text-[#8f918c] hover:text-[#FAF8F5] flex items-center justify-center transition-all cursor-pointer shadow-md"
                          title="Play Next in Queue"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Top-right: Like / Vault */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLike(item);
                          }}
                          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-[6px] border flex items-center justify-center transition-all cursor-pointer shadow-md ${
                            liked
                              ? 'bg-[#cfc6b0] text-[#0d0e11] border-[#cfc6b0]'
                              : 'bg-[#121316]/90 text-[#8f918c] hover:text-[#FAF8F5] border-white/15 hover:border-[#cfc6b0]'
                          }`}
                          title={liked ? 'Remove from My Vault' : 'Save to My Vault'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                        </button>

                        {/* Center: Play / Pause */}
                        <div className="w-11 h-11 rounded-[8px] border border-[#cfc6b0] bg-[#121316] text-[#FAF8F5] flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                          {isCurrentlyPlaying ? (
                            <Pause className="w-4 h-4 fill-current text-[#00f0ff]" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5 text-[#cfc6b0]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Track Titles */}
                    <h3 className="font-space text-sm text-[#FAF8F5] font-normal leading-snug line-clamp-1 group-hover:text-[#cfc6b0] transition-colors mb-1">
                      {item.title}
                    </h3>

                    <p className="font-mono text-xs text-[#8f918c] line-clamp-1 mb-3">
                      {item.artist}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-[#2b2f33] flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#8f918c] tracking-wider">
                      {item.streams ? item.streams.replace(/views|streams/i, 'DISPATCHES') : '1411 KBPS'}
                    </span>

                    <span className={`px-2.5 py-1 rounded-[6px] border text-[9px] uppercase tracking-[0.14em] transition-all ${
                      isCurrentlyPlaying
                        ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                        : 'border-[#cfc6b0]/30 text-[#FAF8F5] group-hover:border-[#cfc6b0] group-hover:text-[#cfc6b0]'
                    }`}>
                      {isCurrentlyPlaying ? 'TRANSMITTING' : 'INITIALIZE'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 4. TRACKS INDEX LIST VIEW */}
        {!isLoading && activeCategory !== 'carriers' && viewMode === 'list' && displayedTracks.length > 0 && (
          <div className="space-y-2 font-mono">
            {displayedTracks.map((item, idx) => {
              const isCurrentlyPlaying = currentTrack?.title === item.title && isPlaying;
              const liked = isLiked(item.id || item.title);
              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleTrackClick(item)}
                  className={`group flex items-center justify-between p-3 rounded-[10px] bg-[#121316] hover:bg-[#1b1b1f] border transition-all cursor-pointer ${
                    isCurrentlyPlaying
                      ? 'border-[#00f0ff] bg-[#1b1b1f]'
                      : 'border-[#2b2f33] hover:border-[#cfc6b0]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs text-[#cfc6b0] w-7 text-center flex-shrink-0">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="relative w-10 h-10 rounded-[6px] overflow-hidden bg-[#0d0e11] flex-shrink-0 border border-white/5">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="truncate flex-1 min-w-0">
                      <h3 className="font-space text-xs text-[#FAF8F5] truncate group-hover:text-[#cfc6b0] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-[#8f918c] truncate">
                        {item.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-3 text-[10px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(item);
                      }}
                      className={`p-1.5 rounded-[6px] border transition-all cursor-pointer ${
                        liked
                          ? 'border-[#cfc6b0] text-[#cfc6b0] bg-[#cfc6b0]/15'
                          : 'border-[#2b2f33] text-[#8f918c] hover:text-[#FAF8F5] hover:border-[#cfc6b0]/40 bg-transparent'
                      }`}
                      title={liked ? 'Saved in Vault' : 'Save to Vault'}
                    >
                      <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayNext(item);
                      }}
                      className="p-1.5 rounded-[6px] border border-[#2b2f33] text-[#8f918c] hover:text-[#FAF8F5] hover:border-[#cfc6b0]/40 bg-transparent transition-all cursor-pointer"
                      title="Play Next in Queue"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <span className="hidden md:inline text-[#8f918c]">
                      FLAC 24-BIT
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackClick(item);
                      }}
                      className={`px-3 py-1 rounded-[6px] border uppercase tracking-[0.14em] transition-all cursor-pointer ${
                        isCurrentlyPlaying
                          ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                          : 'border-[#cfc6b0]/30 text-[#FAF8F5] group-hover:border-[#cfc6b0] group-hover:text-[#cfc6b0]'
                      }`}
                    >
                      {isCurrentlyPlaying ? 'PLAYING' : 'STREAM'}
                    </button>
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
