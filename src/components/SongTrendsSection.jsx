import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Play, Pause, RefreshCw, Flame, Radio, 
  Sparkles, ExternalLink, ChevronDown, ChevronUp, Music 
} from 'lucide-react';
import { trendsService } from '../services/streaming/TrendsService';
import { STATIONS } from '../data/stationsData';

const TREND_CATEGORIES = [
  { id: 'all', label: '🔥 Global Top 50', desc: 'Billboard & Global Chart Leaders' },
  { id: 'spotify', label: '🎧 Spotify Viral', desc: 'Trending on Spotify Daily Viral' },
  { id: 'youtube', label: '📺 YouTube Trending', desc: 'Most Streamed YouTube Music Videos' },
  { id: 'dhh', label: '🎤 Desi Hip-Hop', desc: 'Seedhe Maut, KR$NA, DIVINE, Talha Anjum' },
  { id: 'phonk', label: '🏎️ Drift Phonk', desc: 'Brazilian & Speed Drift B文化的' },
  { id: 'lofi', label: '☕ Lo-Fi & Chill', desc: 'Midnight Study & Rainy Room' },
  { id: 'bollywood', label: '✨ Bollywood Hits', desc: 'Evergreen & Modern Bollywood Gold' }
];

export default function SongTrendsSection({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onSelectStation,
  showToast
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStationsArchive, setShowStationsArchive] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Fetch trends from service
  const loadTrends = useCallback(async (category, query, force = false) => {
    setIsLoading(true);
    try {
      const list = await trendsService.fetchTrends(category, query, force);
      setTrends(list || []);
    } catch (e) {
      console.warn('Failed to load trends:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and category switch
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTrends(activeCategory, searchQuery);
    }, searchQuery ? 350 : 0);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, loadTrends]);

  // Handle Refresh Button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTrends(activeCategory, searchQuery, true);
    if (showToast) {
      showToast('Trending Songs Refreshed');
    }
  };

  // Handle Surf Next: Jump to next trend track
  const handleSurfNext = () => {
    if (!trends || trends.length === 0) return;
    const currentIdx = trends.findIndex((t) => t.title === currentTrack?.title);
    const nextIdx = (currentIdx + 1) % trends.length;
    handleTrackClick(trends[nextIdx]);
  };

  // Handle Play Track (100% Full-Length Audio)
  const handleTrackClick = (track) => {
    if (!onPlayTrack) return;

    const hasValidYtId = Boolean(track.videoId && /^[a-zA-Z0-9_-]{11}$/.test(track.videoId));
    const playable = {
      ...track,
      id: track.id || `trend_${Date.now()}`,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration || 210,
      url: hasValidYtId ? '' : (track.url || ''),
      videoId: hasValidYtId ? track.videoId : '',
      isYouTubeEngine: hasValidYtId,
      isFullTrack: true
    };

    onPlayTrack(playable, trends);
    if (showToast) {
      showToast(`Now Playing: ${track.title}`);
    }
  };

  return (
    <section className="py-12 border-b border-[#343538]/40" id="frequency-directory">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1b1f] border border-[#343538]/50 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfc6b0] tape-pulse" />
            <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest text-[10px]">
              LIVE MUSIC TRENDS // REAL-TIME DISCOVERY
            </span>
          </div>
          <h2 className="font-headline-lg text-[#FAF8F5] tracking-tight">
            Song Trends & Global Hits
          </h2>
          <p className="font-body-md text-[#c5c7c1] text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Real-time trending music aggregated from Spotify Charts, YouTube Music, and Global Viral Tracklists. Stream lossless audio with zero friction.
          </p>
        </div>

        {/* Header Actions: Surf Next, Refresh Button & View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Surf Next */}
          <button
            onClick={handleSurfNext}
            className="px-3.5 py-2 rounded-full bg-[#292a2d] hover:bg-[#343538] text-[#FAF8F5] border border-[#343538]/70 font-label-pill text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Surf to Next Trending Track"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#cfc6b0]" />
            <span className="hidden sm:inline">SURF NEXT</span>
          </button>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center p-1 rounded-full bg-[#1b1b1f] border border-[#343538]/70">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FAF8F5] text-[#121316] font-bold shadow-xs'
                  : 'text-[#8f918c] hover:text-[#FAF8F5]'
              }`}
              title="Card Grid View"
            >
              CARDS
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#FAF8F5] text-[#121316] font-bold shadow-xs'
                  : 'text-[#8f918c] hover:text-[#FAF8F5]'
              }`}
              title="Dense Surf Stream View"
            >
              SURF LIST
            </button>
          </div>

          {/* Refresh Trends Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] text-[#FAF8F5] border border-[#343538]/70 font-label-pill text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh Latest Trends"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#cfc6b0] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'REFRESHING...' : 'REFRESH TRENDS'}</span>
          </button>
        </div>
      </div>

      {/* Internal Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex items-center p-1.5 rounded-xl bg-[#0d0e11]/90 border border-[#343538]/60 shadow-lg focus-within:border-[#cfc6b0]/70 transition-all">
          <div className="flex items-center gap-2 flex-1 px-3 py-1.5">
            <Search className="w-4 h-4 text-[#8f918c] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trending songs, artists, YouTube & Spotify tracks..."
              className="w-full bg-transparent border-none text-[#FAF8F5] placeholder-[#8f918c] text-xs sm:text-sm focus:outline-none font-body-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[11px] font-mono text-[#8f918c] hover:text-[#FAF8F5] cursor-pointer px-2"
              >
                CLEAR
              </button>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 border-l border-[#343538]/50">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f1f23] text-[#cfc6b0] border border-[#343538]/60">
              SPOTIFY + YOUTUBE
            </span>
          </div>
        </div>
      </div>

      {/* Trend Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {TREND_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-label-pill uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer text-xs ${
                isActive
                  ? 'bg-[#FAF8F5] text-[#121316] font-bold shadow-md'
                  : 'bg-[#1b1b1f] hover:bg-[#292a2d] text-[#c5c7c1] hover:text-[#FAF8F5] border border-[#343538]/50'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton / State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#1b1b1f] border border-[#343538]/40 animate-pulse flex flex-col gap-3">
              <div className="aspect-square w-full rounded-xl bg-[#292a2d]" />
              <div className="h-4 bg-[#292a2d] rounded w-3/4" />
              <div className="h-3 bg-[#292a2d] rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Live Trends Cards Grid or Dense Surf List */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="trendTracksGrid">
          {trends.map((item, idx) => {
            const isCurrentlyPlaying = currentTrack?.title === item.title && isPlaying;
            return (
              <article
                key={item.id || idx}
                onClick={() => handleTrackClick(item)}
                className={`group flex flex-col justify-between p-4 rounded-2xl bg-[#1b1b1f] hover:bg-[#1f1f23] border transition-all shadow-md cursor-pointer relative ${
                  isCurrentlyPlaying
                    ? 'border-[#cfc6b0] shadow-[0_0_24px_rgba(207,198,176,0.2)]'
                    : 'border-[#343538]/50 hover:border-[#cfc6b0]/50'
                }`}
              >
                {/* Ranking & Source Badges */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#0d0e11]/90 backdrop-blur-md text-[#FAF8F5] font-mono text-xs font-bold flex items-center justify-center border border-white/10 shadow-sm">
                    #{idx + 1}
                  </span>
                  {item.source === 'spotify' ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 text-[#1db954] font-mono text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      SPOTIFY
                    </span>
                  ) : item.source === 'youtube' ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#ff0000]/20 border border-[#ff0000]/40 text-[#ff4444] font-mono text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      YOUTUBE
                    </span>
                  ) : null}
                </div>

                {/* Badge (Top #1, Viral, etc.) */}
                {item.badge && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-[#0d0e11]/85 backdrop-blur-md text-[#cfc6b0] font-mono text-[9px] uppercase border border-white/10">
                    {item.badge}
                  </div>
                )}

                <div>
                  {/* Artwork Plate */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3.5 bg-[#0d0e11]">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
                      }}
                    />

                    {/* Hover Quick Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#121316] flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        {isCurrentlyPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Track Titles */}
                  <h3 className="font-headline-sm text-sm text-[#FAF8F5] leading-snug line-clamp-1 group-hover:text-[#cfc6b0] transition-colors mb-1">
                    {item.title}
                  </h3>

                  <p className="font-body-sm text-xs text-[#c5c7c1] line-clamp-1 mb-2">
                    {item.artist}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#343538]/40 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-[#8f918c]">
                      {item.streams || 'Lossless Stream'}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-label-pill uppercase text-[10px] transition-colors flex items-center gap-1 ${
                    isCurrentlyPlaying
                      ? 'bg-[#cfc6b0] text-[#121316] font-bold'
                      : 'bg-[#292a2d] text-[#FAF8F5] group-hover:bg-[#FAF8F5] group-hover:text-[#121316]'
                  }`}>
                    {isCurrentlyPlaying ? 'PLAYING' : 'PLAY'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Dense Surf List View (Rapid Surfing) */}
      {!isLoading && viewMode === 'list' && (
        <div className="space-y-2" id="trendTracksList">
          {trends.map((item, idx) => {
            const isCurrentlyPlaying = currentTrack?.title === item.title && isPlaying;
            return (
              <div
                key={item.id || idx}
                onClick={() => handleTrackClick(item)}
                className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#1b1b1f] hover:bg-[#25252a] border transition-all cursor-pointer ${
                  isCurrentlyPlaying
                    ? 'border-[#cfc6b0] shadow-md bg-[#25252a]'
                    : 'border-[#343538]/50 hover:border-[#cfc6b0]/50'
                }`}
              >
                {/* Left: Rank, Art, Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="font-mono text-xs text-[#8f918c] w-6 text-center flex-shrink-0 font-bold">
                    #{idx + 1}
                  </span>

                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#0d0e11] flex-shrink-0 border border-white/5">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 text-[#FAF8F5] fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-[#FAF8F5] fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="truncate flex-1 min-w-0">
                    <h3 className="font-headline-sm text-sm text-[#FAF8F5] truncate group-hover:text-[#cfc6b0] transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-body-sm text-xs text-[#c5c7c1] truncate">
                      {item.artist}
                    </p>
                  </div>
                </div>

                {/* Right: Badges, Telemetry & Play Button */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  {item.source === 'spotify' ? (
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 text-[#1db954] font-mono text-[9px] font-bold uppercase">
                      SPOTIFY
                    </span>
                  ) : item.source === 'youtube' ? (
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-[#ff0000]/20 border border-[#ff0000]/40 text-[#ff4444] font-mono text-[9px] font-bold uppercase">
                      YOUTUBE
                    </span>
                  ) : null}

                  <span className="hidden md:inline font-mono text-xs text-[#8f918c]">
                    {item.streams}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackClick(item);
                    }}
                    className={`px-3 py-1.5 rounded-full font-label-pill text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrentlyPlaying
                        ? 'bg-[#cfc6b0] text-[#121316] font-bold'
                        : 'bg-[#292a2d] text-[#FAF8F5] group-hover:bg-[#FAF8F5] group-hover:text-[#121316]'
                    }`}
                  >
                    {isCurrentlyPlaying ? (
                      <>
                        <Pause className="w-3 h-3 fill-current" />
                        <span>PLAYING</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                        <span>SURF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty Search State */}
      {!isLoading && trends.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#1b1b1f] border border-[#343538]/40">
          <p className="font-body-md text-[#FAF8F5] mb-2">No trending tracks found for "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-full bg-[#FAF8F5] text-[#121316] text-xs font-bold cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Toggle Native 28 Viberr Archive Stations */}
      <div className="mt-12 flex flex-col items-center">
        <button
          onClick={() => setShowStationsArchive((prev) => !prev)}
          className="px-6 py-2.5 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] border border-[#343538]/70 text-[#FAF8F5] font-label-pill text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Radio className="w-3.5 h-3.5 text-[#cfc6b0]" />
          <span>{showStationsArchive ? 'Hide Native Radio Stations' : `Browse All ${STATIONS.length} Native Radio Stations`}</span>
          {showStationsArchive ? <ChevronUp className="w-4 h-4 text-[#cfc6b0]" /> : <ChevronDown className="w-4 h-4 text-[#cfc6b0]" />}
        </button>

        {showStationsArchive && (
          <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {STATIONS.map((station, idx) => (
              <div
                key={station.id}
                onClick={() => onSelectStation && onSelectStation(station)}
                className="p-3 rounded-xl bg-[#1b1b1f]/80 hover:bg-[#292a2d] border border-[#343538]/40 hover:border-[#cfc6b0]/40 transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#0d0e11] relative">
                  <img
                    src={station.desktopBgs?.[0] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'}
                    alt={station.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#0d0e11]/80 text-[9px] font-mono text-[#cfc6b0]">
                    #{idx + 1}
                  </div>
                </div>
                <div className="truncate">
                  <span className="font-headline-sm text-xs text-[#FAF8F5] block truncate">
                    {station.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#8f918c] truncate block">
                    {station.songs?.length || 0} Tracks • FLAC
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
