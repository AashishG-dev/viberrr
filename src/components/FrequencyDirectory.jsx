import React, { useState, useMemo } from 'react';
import { Search, PlayCircle, Radio, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { STATIONS } from '../data/stationsData';

// Map primary Stitch categories to actual stations
const CATEGORIES = [
  { id: 'all', label: 'ALL FREQUENCIES', ch: '28' },
  { id: 'dhh', label: 'DESI HIP HOP', ch: 'CH 01' },
  { id: 'phonk', label: 'NIGHT DRIVE & PHONK', ch: 'CH 02' },
  { id: 'bollywood', label: 'RETRO BOLLYWOOD', ch: 'CH 03' },
  { id: 'lofi', label: 'LO-FI & RAIN', ch: 'CH 04' },
  { id: 'synth', label: 'ANALOG SYNTH', ch: 'CH 05' },
  { id: 'ambient', label: 'AMBIENT & DRONE', ch: 'CH 06' }
];

// Curated primary presets to present first (matching Stitch screens exactly)
const FEATURED_CHANNELS = [
  {
    stationId: 'dhh-drips',
    category: 'dhh',
    ch: 'CH 01 // DELHI',
    title: 'Desi Hip Hop & Raw Gully Tape',
    subtitle: 'ACOUSTIC SUB-FREQUENCY & RAW TAPE',
    desc: 'Sub-bass dynamics paired with traditional folk acoustic resonance, recorded straight to vintage Ampex tape machines in old quarter basements.',
    codec: '24-BIT FLAC // 96 kHz',
    listeners: '2,819',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
  },
  {
    stationId: 'phonk-drift',
    category: 'phonk',
    ch: 'CH 02 // MEMPHIS',
    title: 'Midnight Phonk & Night Drive',
    subtitle: 'TAPE SATURATION & LINNDRUM',
    desc: 'Analog cassette crunch, drifting Cowbell chords, and punchy kick decays curated exclusively for solitary open-road journeys past 02:00.',
    codec: '320 KBPS LOSSLESS',
    listeners: '3,482',
    cover: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80'
  },
  {
    stationId: 'dil-ke-paas-wale-gaane',
    category: 'bollywood',
    ch: 'CH 03 // BOMBAY',
    title: 'Retro Bollywood & Golden Era',
    subtitle: 'DUSTY RHODES & ARCHIVAL BRASS',
    desc: 'Rare 1970s Bombay pressings transferred via custom micro-groove optical pickup needles to preserve gentle natural tape wow and flutter.',
    codec: '432 HZ MASTER DIRECT',
    listeners: '1,940',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'
  },
  {
    stationId: 'soft-lofi',
    category: 'lofi',
    ch: 'CH 04 // KYOTO',
    title: 'Kyoto Rainy Lofi & Tea Solitude',
    subtitle: 'BINAURAL FIELD RECORDING',
    desc: 'Unobtrusive felted upright piano phrases interwoven with pristine binaural recordings of spring downpours on cedar roof tiles.',
    codec: 'PROCEDURAL LOSSLESS',
    listeners: '4,105',
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80'
  },
  {
    stationId: 'speed-up-nightcore',
    category: 'synth',
    ch: 'CH 05 // BERLIN',
    title: 'Analog Synth & Cinema Nocturne',
    subtitle: 'JUNO-106 & TAPE DELAYS',
    desc: 'Slow, evolving polysynth progressions, vintage European cinema cues, and wide stereo chorus textures without harsh digital overtones.',
    codec: 'STUDIO REEL MASTER',
    listeners: '2,120',
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80'
  },
  {
    stationId: 'slowed-reverb-3am',
    category: 'ambient',
    ch: 'CH 06 // OSLO',
    title: 'Astral Drone & Deep Resonance',
    subtitle: 'MODULAR SUB-HARMONICS',
    desc: 'Hypnotic low-end foundations, pure sine wave intersections, and infinite reverb spaces configured to encourage profound mental stillness.',
    codec: 'BINAURAL 96 kHz',
    listeners: '1,675',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
  }
];

export default function FrequencyDirectory({
  currentStation,
  onSelectStation,
  onOpenGlobalSearch
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStations, setShowAllStations] = useState(false);

  // Filtered featured channels
  const displayedChannels = useMemo(() => {
    let list = FEATURED_CHANNELS;

    if (activeCategory !== 'all') {
      list = list.filter((ch) => ch.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ch) =>
          ch.title.toLowerCase().includes(q) ||
          ch.desc.toLowerCase().includes(q) ||
          ch.ch.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  // All catalog stations when expanded
  const filteredAllStations = useMemo(() => {
    if (!showAllStations) return [];
    if (!searchQuery.trim()) return STATIONS;
    const q = searchQuery.toLowerCase().trim();
    return STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.tagline && s.tagline.toLowerCase().includes(q))
    );
  }, [showAllStations, searchQuery]);

  const handleTuneIn = (stationId) => {
    const target = STATIONS.find((s) => s.id === stationId);
    if (target) {
      onSelectStation(target);
    }
  };

  return (
    <section className="py-12 border-b border-[#343538]/40" id="frequency-directory">
      {/* Category Bar & Direct Search Switcher */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#cfc6b0]" />
            <span className="font-label-telemetry text-[#FAF8F5] uppercase tracking-wider">
              INSTANT FREQUENCY SELECTOR
            </span>
            <span className="text-[#8f918c] text-xs hidden sm:inline">• Zero friction 1-click tuning</span>
          </div>
          <span className="font-label-telemetry text-[#8f918c] uppercase font-mono">
            {STATIONS.length} SOVEREIGN TRANSMITTERS ACTIVE
          </span>
        </div>

        {/* Search & Codec Pill Input Bar */}
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-1.5 rounded-xl bg-[#0d0e11]/90 border border-[#343538]/60 shadow-lg mb-4 focus-within:border-[#cfc6b0]/70 transition-all">
          <div className="flex items-center gap-2 flex-1 px-3 py-1">
            <Search className="w-4 h-4 text-[#8f918c] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search track, artist, reel, or tape archive across all providers (⌘K)..."
              className="w-full bg-transparent border-none text-[#FAF8F5] placeholder-[#8f918c] text-sm focus:outline-none font-body-md"
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 px-2 py-1 border-t md:border-t-0 md:border-l border-[#343538]/40">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#1f1f23] text-[#cfc6b0] border border-[#343538]/60 flex-shrink-0">
                FLAC 24-BIT
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#1f1f23] text-[#c5c7c1] border border-[#343538]/60 flex-shrink-0">
                TAPE REEL
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#1f1f23] text-[#c5c7c1] border border-[#343538]/60 flex-shrink-0">
                LOSSLESS R2
              </span>
            </div>
            <button
              onClick={onOpenGlobalSearch}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#343538] text-[10px] font-mono text-[#8f918c] hover:text-[#FAF8F5] border border-[#343538]/80 cursor-pointer transition-colors shadow-sm ml-1"
              title="Open Global Search"
            >
              <span>⌘</span><span>K</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" id="categoryFilterBar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-label-pill uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF8F5] text-[#121316] shadow-md'
                    : 'bg-[#1b1b1f] hover:bg-[#292a2d] text-[#c5c7c1] hover:text-[#FAF8F5] border border-[#343538]/50'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[#121316] text-[#FAF8F5]' : 'bg-[#0d0e11] text-[#cfc6b0]'
                  }`}
                >
                  {cat.ch}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Curated Continuous Transmissions Grid */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-label-telemetry uppercase text-[#cfc6b0] tracking-widest block mb-1">
            CONTINUOUS BROADCAST GRID
          </span>
          <h2 className="font-headline-lg text-[#FAF8F5] tracking-tight">Curated Transmissions</h2>
        </div>
        <p className="font-body-md text-[#c5c7c1] max-w-md text-sm">
          Click any card to instantly tune the live stream. Sovereign acoustic streams with zero algorithms, zero automated cross-fades, and uncompressed dynamics.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="stationCardsGrid">
        {displayedChannels.map((item) => {
          const isTunedIn = currentStation?.id === item.stationId;
          return (
            <article
              key={item.stationId}
              onClick={() => handleTuneIn(item.stationId)}
              className={`group flex flex-col justify-between p-6 rounded-2xl bg-[#1b1b1f] hover:bg-[#1f1f23] border transition-all shadow-lg cursor-pointer relative ${
                isTunedIn ? 'border-[#cfc6b0]/80 shadow-[0_0_20px_rgba(207,198,176,0.15)]' : 'border-[#343538]/50 hover:border-[#cfc6b0]/40'
              }`}
            >
              {/* Tuned In Badge */}
              {isTunedIn && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#cfc6b0] text-[#121316] text-[10px] font-mono font-bold uppercase tracking-wider z-10 shadow-md">
                  TUNED IN
                </div>
              )}

              <div>
                {/* Artwork Plate */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-[#0d0e11]">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0d0e11]/85 backdrop-blur-sm font-label-telemetry text-[#cfc6b0] uppercase border border-white/5 text-[10px]">
                    {item.ch}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[#0d0e11]/85 backdrop-blur-sm text-[#FAF8F5] font-mono text-[10px]">
                    {item.listeners} LISTENERS
                  </div>
                </div>

                <span className="font-label-telemetry uppercase text-[#8f918c] tracking-wider block text-[10px]">
                  {item.subtitle}
                </span>

                <h3 className="font-headline-md text-[#FAF8F5] mt-1 mb-2 leading-snug group-hover:text-[#cfc6b0] transition-colors">
                  {item.title}
                </h3>

                <p className="font-body-sm text-[#c5c7c1] text-xs leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-[#343538]/40 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-telemetry text-[#8f918c] uppercase text-[10px]">FEED CODEC</span>
                  <span className="font-label-telemetry text-[#FAF8F5] font-medium font-mono text-xs">
                    {item.codec}
                  </span>
                </div>

                <button
                  className={`px-4 py-1.5 rounded-full font-label-pill uppercase transition-colors flex items-center gap-1.5 text-xs ${
                    isTunedIn
                      ? 'bg-[#FAF8F5] text-[#121316]'
                      : 'bg-[#292a2d] text-[#e3e2e6] group-hover:bg-[#FAF8F5] group-hover:text-[#121316]'
                  }`}
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{isTunedIn ? 'Active' : 'Tune In'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Toggle View All 28 Stations */}
      <div className="mt-10 flex flex-col items-center">
        <button
          onClick={() => setShowAllStations((prev) => !prev)}
          className="px-6 py-2.5 rounded-full bg-[#1b1b1f] hover:bg-[#292a2d] border border-[#343538]/70 text-[#FAF8F5] font-label-pill uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <span>{showAllStations ? 'Hide Full Vault Archive' : `Explore All ${STATIONS.length} Archive Vaults`}</span>
          {showAllStations ? <ChevronUp className="w-4 h-4 text-[#cfc6b0]" /> : <ChevronDown className="w-4 h-4 text-[#cfc6b0]" />}
        </button>

        {showAllStations && (
          <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAllStations.map((station, idx) => {
              const isActive = currentStation?.id === station.id;
              return (
                <div
                  key={station.id}
                  onClick={() => onSelectStation(station)}
                  className={`p-3 rounded-xl bg-[#1b1b1f]/80 hover:bg-[#292a2d] border transition-all cursor-pointer flex flex-col gap-2 ${
                    isActive ? 'border-[#cfc6b0] shadow-md' : 'border-[#343538]/40 hover:border-[#cfc6b0]/40'
                  }`}
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
