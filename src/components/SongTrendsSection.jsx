import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Play, Pause, RefreshCw, Radio, 
  Sparkles, ChevronDown, ChevronUp, Activity, Sliders, Heart, Plus
} from 'lucide-react';
import { trendsService } from '../services/streaming/TrendsService';
import { STATIONS } from '../data/stationsData';
import { useAudio } from '../context/AudioContext';

const BASE_TREND_CATEGORIES = [
  { id: 'all', code: '01', label: 'ALL', desc: 'Apex & Chart Leaders' },
  { id: 'vault', code: '★', label: 'MY VAULT', desc: 'Personal Saved Tracks' },
  { id: 'spotify', code: '02', label: 'RADAR', desc: 'Emerging Spectral Waves' },
  { id: 'youtube', code: '03', label: 'AIRPLAY', desc: 'Continuous Broadcast Feeds' },
  { id: 'dhh', code: '04', label: 'UNDERGROUND', desc: 'Subcontinental Raw Tapes' },
  { id: 'phonk', code: '05', label: 'DRIFT', desc: 'High-Octane Analog Speed' },
  { id: 'lofi', code: '06', label: 'CHILL', desc: 'Nocturnal Study & Rain' },
  { id: 'bollywood', code: '07', label: 'VINYL', desc: 'Cinema Master Recordings' }
];

function SongTrendsSection({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onSelectStation,
  showToast
}) {
  const {
    vaultTracks,
    isLiked,
    handleToggleLike,
    handlePlayNext,
    vaultCount
  } = useAudio();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStationsArchive, setShowStationsArchive] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const loadTrends = useCallback(async (category, query, force = false) => {
    if (category === 'vault') {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await trendsService.fetchTrends(category, query, force);
      setTrends(list || []);
    } catch (e) {
      console.warn('Failed to load telemetry trends:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTrends(activeCategory, searchQuery);
    }, searchQuery ? 350 : 0);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, loadTrends]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTrends(activeCategory, searchQuery, true);
    if (showToast) {
      showToast('Telemetry Radar Synchronized');
    }
  };

  const categories = useMemo(() => {
    return BASE_TREND_CATEGORIES.map((cat) => {
      if (cat.id === 'vault') {
        return { ...cat, label: `MY VAULT (${vaultCount})` };
      }
      return cat;
    });
  }, [vaultCount]);

  const displayedTracks = useMemo(() => {
    if (activeCategory === 'vault') {
      if (!searchQuery.trim()) return vaultTracks;
      const q = searchQuery.toLowerCase();
      return vaultTracks.filter(
        (t) => (t.title && t.title.toLowerCase().includes(q)) || (t.artist && t.artist.toLowerCase().includes(q))
      );
    }
    return trends;
  }, [activeCategory, vaultTracks, searchQuery, trends]);

  const handleSurfNext = () => {
    if (displayedTracks && displayedTracks.length > 0) {
      const randomTrack = displayedTracks[Math.floor(Math.random() * displayedTracks.length)];
      if (randomTrack && onPlayTrack) {
        handleTrackClick(randomTrack);
      }
    }
  };

  const handleTrackClick = (track) => {
    if (!onPlayTrack) return;

    const hasValidYtId = Boolean(track.videoId && /^[a-zA-Z0-9_-]{11}$/.test(track.videoId));
    const playable = {
      ...track,
      id: track.id || `radar_${Date.now()}`,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration || 210,
      url: hasValidYtId ? '' : (track.url || ''),
      videoId: hasValidYtId ? track.videoId : '',
      isYouTubeEngine: hasValidYtId,
      isFullTrack: true
    };

    onPlayTrack(playable, displayedTracks);
    if (showToast) {
      showToast(`Transmitting: ${track.title}`);
    }
  };

  return (
    <section className="py-12 sm:py-16 border-b border-[#2b2f33]/60 relative" id="frequency-directory">
      
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.18em] uppercase text-[#cfc6b0]">
            <span>✦ RADAR ARCHIVE</span>
          </div>
          <h2 className="display-monument text-2xl sm:text-3xl lg:text-4xl text-[#FAF8F5]">
            Radar & <span className="word-tracer">Archive</span>
          </h2>
          <p className="font-mono text-xs text-[#8f918c] mt-1.5 tracking-wide">
            Curated live feeds and master recordings.
          </p>
        </div>

        {/* Action Controls: Surf Next, Cards/List View, Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSurfNext}
            className="wireframe-btn !px-3 !py-1.5"
            title="Surf to Next Radar Track"
          >
            <Sparkles className="w-3 h-3 text-[#cfc6b0]" />
            <span>SURF</span>
          </button>

          {/* View Mode Toggle: Grid vs List */}
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

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="wireframe-btn !px-2.5 !py-1.5"
            title="Synchronize Live Stream"
          >
            <RefreshCw className={`w-3 h-3 text-[#cfc6b0] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'SYNC...' : 'SYNC'}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative flex items-center p-1 rounded-[10px] bg-[#0d0e11] border border-[#2b2f33] focus-within:border-[#cfc6b0]/50 transition-colors">
          <div className="flex items-center gap-3 flex-1 px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#8f918c] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks or channels..."
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
              LOSSLESS CARRIERS
            </span>
          </div>
        </div>
      </div>

      {/* Monospaced Category Selector Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 trend-adaptive-grid gap-6 py-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="p-5 rounded-[16px] bg-[#121316] border border-[#2b2f33] animate-pulse flex flex-col gap-3">
              <div className="aspect-square w-full rounded-[10px] bg-[#1b1b1f]" />
              <div className="h-4 bg-[#1b1b1f] rounded w-3/4" />
              <div className="h-3 bg-[#1b1b1f] rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State for Vault or Search */}
      {!isLoading && displayedTracks.length === 0 && (
        <div className="py-16 px-6 text-center font-mono border border-dashed border-[#2b2f33] rounded-[16px] bg-[#121316]/50 max-w-2xl mx-auto my-6">
          {activeCategory === 'vault' ? (
            <>
              <Heart className="w-8 h-8 text-[#8f918c] mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-space text-[#FAF8F5] mb-1">Your Personal Vault is Empty</h4>
              <p className="text-xs text-[#8f918c] max-w-sm mx-auto leading-relaxed">
                Click the <Heart className="w-3 h-3 inline text-[#cfc6b0] mx-0.5" /> icon on any track or in the Master Deck to store your personal favorites locally without accounts.
              </p>
            </>
          ) : (
            <>
              <Search className="w-8 h-8 text-[#8f918c] mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-space text-[#FAF8F5] mb-1">No Frequency Nodes Discovered</h4>
              <p className="text-xs text-[#8f918c]">Try adjusting your search query or refreshing the radar.</p>
            </>
          )}
        </div>
      )}

      {/* Matrix Cards View (Atlantic.vc 3/4 Column Wireframe Grid) */}
      {!isLoading && viewMode === 'grid' && displayedTracks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 trend-adaptive-grid gap-4 sm:gap-6" id="trendTracksGrid">
          {displayedTracks.map((item, idx) => {
            const isCurrentlyPlaying = currentTrack?.title === item.title && isPlaying;
            const liked = isLiked(item.id || item.title);
            return (
              <article
                key={item.id || idx}
                onClick={() => handleTrackClick(item)}
                className={`group flex flex-col justify-between p-4 sm:p-5 rounded-[16px] section-surface-card hover:bg-[#181b24] border transition-all duration-200 cursor-pointer relative shadow-lg ${
                  isCurrentlyPlaying
                    ? 'border-[#00f0ff] shadow-[0_0_24px_rgba(0,240,255,0.2)]'
                    : 'border-[#cfc6b0]/25 hover:border-[#cfc6b0]/60'
                }`}
              >
                {/* CAD Telemetry Tag */}
                <div className="flex items-center justify-between mb-3 text-[9px] font-mono tracking-[0.16em] uppercase text-[#9ca0a8]">
                  <span className="text-[#cfc6b0] font-semibold">#{String(idx + 1).padStart(2, '0')} // NODE</span>
                  <span className="text-[#00f0ff] font-semibold bg-[#00f0ff]/10 px-1.5 py-0.5 rounded-[4px] border border-[#00f0ff]/20">FLAC 24-BIT</span>
                </div>

                <div>
                  {/* Artwork Preview Frame with Hairline Border */}
                  <div className="relative aspect-square w-full rounded-[12px] overflow-hidden mb-3.5 bg-[#090a0d] border border-white/10 shadow-inner">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
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
                      <div className="w-12 h-12 rounded-[10px] border border-[#cfc6b0] bg-[#14161f] text-[#FAF8F5] flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        {isCurrentlyPlaying ? (
                          <Pause className="w-5 h-5 fill-current text-[#00f0ff]" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5 text-[#cfc6b0]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Track Titles */}
                  <h3 className="font-space text-sm text-[#FFFFFF] font-medium leading-snug line-clamp-1 group-hover:text-[#00f0ff] transition-colors mb-1">
                    {item.title}
                  </h3>

                  <p className="font-mono text-xs text-[#C4C8D0] line-clamp-1 mb-3">
                    {item.artist}
                  </p>
                </div>

                {/* Card Footer with Outlined Action Trigger */}
                <div className="pt-3 border-t border-[#262832] flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#9ca0a8] tracking-wider">
                    {item.streams ? item.streams.replace(/views|streams/i, 'DISPATCHES') : '1411 KBPS'}
                  </span>

                  <span className={`px-2.5 py-1 rounded-[6px] border text-[9px] uppercase tracking-[0.14em] transition-all font-semibold ${
                    isCurrentlyPlaying
                      ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/15 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'border-[#cfc6b0]/35 text-[#FAF8F5] group-hover:border-[#FAF8F5] group-hover:text-[#FFFFFF]'
                  }`}>
                    {isCurrentlyPlaying ? 'TRANSMITTING' : 'PLAY DIRECT'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Index List View */}
      {!isLoading && viewMode === 'list' && displayedTracks.length > 0 && (
        <div className="space-y-2 font-mono" id="trendTracksList">
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
                  {/* Quick Vault & Play Next buttons in List View */}
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

      {/* Toggle Native 28 Viberr Archive Stations */}
      <div className="mt-14 flex flex-col items-center">
        <button
          onClick={() => setShowStationsArchive((prev) => !prev)}
          className="wireframe-btn !py-2.5 !px-6"
        >
          <Radio className="w-3.5 h-3.5 text-[#cfc6b0]" />
          <span>{showStationsArchive ? 'CONCEAL ARCHIVAL STATIONS' : `EXPAND ALL ${STATIONS.length} SOVEREIGN CARRIERS`}</span>
          {showStationsArchive ? <ChevronUp className="w-3.5 h-3.5 text-[#cfc6b0]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#cfc6b0]" />}
        </button>

        {showStationsArchive && (
          <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {STATIONS.map((station, idx) => (
              <div
                key={station.id}
                onClick={() => onSelectStation && onSelectStation(station)}
                className="p-3 rounded-[12px] bg-[#121316] hover:bg-[#1b1b1f] border border-[#2b2f33] hover:border-[#cfc6b0]/50 transition-all cursor-pointer flex flex-col gap-2 font-mono"
              >
                <div className="aspect-square w-full rounded-[8px] overflow-hidden bg-[#0d0e11] relative border border-white/5">
                  <img
                    src={station.desktopBgs?.[0] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'}
                    alt={station.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-[4px] bg-[#0d0e11]/85 text-[8px] font-mono text-[#cfc6b0]">
                    #{String(idx + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="truncate">
                  <span className="font-space text-xs text-[#FAF8F5] block truncate font-normal">
                    {station.name}
                  </span>
                  <span className="text-[9px] text-[#8f918c] truncate block mt-0.5">
                    {station.songs?.length || 0} TRACKS // FLAC
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default React.memo(SongTrendsSection);

