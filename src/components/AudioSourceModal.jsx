import React, { useState } from 'react';
import { 
  X, Zap, Radio, Globe, Sparkles, Check, Link as LinkIcon, Disc3, 
  Terminal, Waves, Compass, Flame, Shield, Search
} from 'lucide-react';
import { sanitizeAudioUrl, sanitizeInputText } from '../utils/formatters';

export const AUDIO_SOURCES = [
  {
    id: 'viberr-cdn',
    name: 'Viberr Hi-Fi Lossless CDN',
    desc: '2,229+ curated lossless tracks',
    category: 'curated',
    type: 'curated',
    icon: Zap,
    badge: 'LOSSLESS',
    color: '#34d399',
    desktopBgs: [
      "/backgrounds/retro_bollywood_lounge.jpg",
      "/backgrounds/midnight_lofi_bedroom.jpg",
      "/backgrounds/cyberpunk_drift_phonk.jpg"
    ],
    mobileBg: "/backgrounds/retro_bollywood_lounge.jpg"
  },
  {
    id: 'somafm-groovesalad',
    name: 'SomaFM — Groove Salad',
    desc: 'Ambient, downtempo & chillout grooves',
    category: 'ambient',
    type: 'live-stream',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    icon: Waves,
    badge: 'SOMA FM',
    color: '#06b6d4',
    desktopBgs: [
      "/backgrounds/midnight_lofi_bedroom.jpg",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
    ],
    mobileBg: "/backgrounds/midnight_lofi_bedroom.jpg"
  },
  {
    id: 'phonk-drift-radio',
    name: 'Brazilian & Drift Phonk 24/7',
    desc: 'High-octane Brazilian phonk & drift beats',
    category: 'cyberpunk',
    type: 'live-stream',
    url: 'https://stream.nightride.fm/darksynth.mp3',
    icon: Flame,
    badge: 'PHONK',
    color: '#ec4899',
    desktopBgs: [
      "/backgrounds/cyberpunk_drift_phonk.jpg",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074&auto=format&fit=crop"
    ],
    mobileBg: "/backgrounds/cyberpunk_drift_phonk.jpg"
  },
  {
    id: 'nightride-synthwave',
    name: 'Nightride FM — Synthwave 24/7',
    desc: 'Pure cyberpunk, outrun & darksynth',
    category: 'cyberpunk',
    type: 'live-stream',
    url: 'https://stream.nightride.fm/nightride.mp3',
    icon: Radio,
    badge: 'CYBERPUNK',
    color: '#f43f5e',
    desktopBgs: [
      "/backgrounds/cyberpunk_drift_phonk.jpg",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070&auto=format&fit=crop"
    ],
    mobileBg: "/backgrounds/cyberpunk_drift_phonk.jpg"
  },
  {
    id: 'nightride-chillsynth',
    name: 'ChillSynth FM — Lofi & Retrowave',
    desc: 'Retro chill, lo-fi beats & mellow synth',
    category: 'chill',
    type: 'live-stream',
    url: 'https://stream.nightride.fm/chillsynth.mp3',
    icon: Disc3,
    badge: 'LO-FI',
    color: '#a855f7',
    desktopBgs: [
      "/backgrounds/midnight_lofi_bedroom.jpg",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop"
    ],
    mobileBg: "/backgrounds/midnight_lofi_bedroom.jpg"
  },
  {
    id: 'somafm-defcon',
    name: 'SomaFM — DEF CON Radio',
    desc: 'Hacker electronic, glitch & cyberpunk bass',
    category: 'cyberpunk',
    type: 'live-stream',
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    icon: Terminal,
    badge: 'DEF CON',
    color: '#10b981',
    desktopBgs: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
      "/backgrounds/cyberpunk_drift_phonk.jpg"
    ],
    mobileBg: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: 'somafm-dronezone',
    name: 'SomaFM — Drone Zone',
    desc: 'Deep atmospheric ambient space exploration',
    category: 'ambient',
    type: 'live-stream',
    url: 'https://ice1.somafm.com/dronezone-128-mp3',
    icon: Sparkles,
    badge: 'FOCUS',
    color: '#38bdf8',
    desktopBgs: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
      "/backgrounds/midnight_lofi_bedroom.jpg"
    ],
    mobileBg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: 'somafm-vaporwaves',
    name: 'SomaFM — Vaporwaves',
    desc: 'Nostalgic 80s/90s vaporwave & future funk',
    category: 'chill',
    type: 'live-stream',
    url: 'https://ice1.somafm.com/vaporwaves-128-mp3',
    icon: Flame,
    badge: 'VAPORWAVE',
    color: '#f43f5e',
    desktopBgs: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=2080&auto=format&fit=crop",
      "/backgrounds/midnight_lofi_bedroom.jpg"
    ],
    mobileBg: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: 'somafm-suburbsofgoa',
    name: 'SomaFM — Suburbs of Goa',
    desc: 'Desi Asian ambient beats & sitar dub',
    category: 'ambient',
    type: 'live-stream',
    url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    icon: Compass,
    badge: 'DESI BEATS',
    color: '#f59e0b',
    desktopBgs: [
      "/backgrounds/retro_bollywood_lounge.jpg",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop"
    ],
    mobileBg: "/backgrounds/retro_bollywood_lounge.jpg"
  },
  {
    id: 'somafm-spacestation',
    name: 'SomaFM — Space Station',
    desc: 'Spacewalk ambient & mid-tempo electronica',
    category: 'ambient',
    type: 'live-stream',
    url: 'https://ice1.somafm.com/spacestation-128-mp3',
    icon: Globe,
    badge: 'SCI-FI',
    color: '#8b5cf6',
    desktopBgs: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2065&auto=format&fit=crop"
    ],
    mobileBg: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1080&auto=format&fit=crop"
  },
  {
    id: 'somafm-secretagent',
    name: 'SomaFM — Secret Agent',
    desc: 'Cinematic soundtrack & spy film lounge',
    category: 'chill',
    type: 'live-stream',
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    icon: Shield,
    badge: 'CINEMATIC',
    color: '#eab308',
    desktopBgs: [
      "/backgrounds/retro_bollywood_lounge.jpg",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074&auto=format&fit=crop"
    ],
    mobileBg: "/backgrounds/retro_bollywood_lounge.jpg"
  }
];

export default function AudioSourceModal({
  isOpen,
  onClose,
  currentSourceId,
  onSelectSource,
  currentQuality = '320k',
  onChangeQuality
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [inputError, setInputError] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Sources' },
    { id: 'curated', label: 'Lossless CDN' },
    { id: 'cyberpunk', label: 'Cyberpunk / Synth' },
    { id: 'ambient', label: 'Ambient / Focus' },
    { id: 'chill', label: 'Chill & Lofi' }
  ];

  const filteredSources = AUDIO_SOURCES.filter((source) => {
    const matchesCategory = activeCategory === 'all' || source.category === activeCategory;
    const matchesSearch = 
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.badge?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const safeUrl = sanitizeAudioUrl(customUrl);
    if (!safeUrl) {
      setInputError('Please enter a valid https:// or http:// audio stream URL');
      return;
    }
    setInputError('');
    const safeTitle = sanitizeInputText(customTitle) || 'Custom Live Stream';
    onSelectSource({
      id: 'custom-stream',
      name: safeTitle,
      desc: safeUrl,
      type: 'custom',
      url: safeUrl,
      icon: LinkIcon,
      badge: 'CUSTOM',
      color: '#f59e0b'
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl pointer-events-auto transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl max-h-[90vh] rounded-3xl glass-panel border border-white/20 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-inner flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-syne tracking-tight">
                Audio Stream Engine & Global Sources
              </h3>
              <p className="text-xs text-white/60 font-space">
                Nuclear & SomaFM live streams, Lossless Cloud CDN, and custom endpoints
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="glass-button p-2 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mt-2.5 relative flex items-center flex-shrink-0">
          <Search className="w-4 h-4 absolute left-3 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Nuclear sources, genres, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/40 text-xs rounded-xl pl-9 pr-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50"
          />
        </div>

        {/* Source List */}
        <div className="mt-3 space-y-2 flex-1 overflow-y-auto pr-1 custom-scroll min-h-[220px]">
          {filteredSources.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-white/50">
              [ NO STREAM SOURCES MATCHING "{searchQuery}" ]
            </div>
          ) : (
            filteredSources.map((source) => {
              const isSelected = currentSourceId === source.id;
              const IconComponent = source.icon;

              return (
                <button
                  key={source.id}
                  onClick={() => {
                    onSelectSource(source);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all group cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 border-white/40 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{
                        backgroundColor: `${source.color}22`,
                        borderColor: `${source.color}44`,
                        color: source.color
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="truncate flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white truncate font-syne">
                          {source.name}
                        </span>
                        {source.badge && (
                          <span
                            className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-md tracking-wider flex-shrink-0"
                            style={{
                              backgroundColor: `${source.color}33`,
                              color: source.color
                            }}
                          >
                            {source.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/60 truncate mt-0.5 font-space">
                        {source.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-white/40" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Custom Stream Accordion Toggle */}
        <div className="mt-3 pt-3 border-t border-white/10 flex-shrink-0">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Connect Custom Icecast / Nuclear Web Stream URL</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                <span>Custom Stream Link</span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-white/40 hover:text-white text-[10px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Stream Name (e.g. My Private Radio)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/40 text-xs rounded-xl px-3 py-2 outline-none border border-white/10"
              />
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://your-stream-url.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-white/10 text-white placeholder-white/40 text-xs rounded-xl px-3 py-2 outline-none border border-white/10"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Tune In
                </button>
              </div>
              {inputError && (
                <p className="text-[11px] font-mono text-red-400 font-medium px-1">
                  {inputError}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
