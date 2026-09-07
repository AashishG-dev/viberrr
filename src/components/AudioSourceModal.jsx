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
        className="w-full max-w-xl max-h-[90vh] rounded-[16px] bg-[#121316] border border-[#cfc6b0]/30 shadow-2xl p-5 sm:p-7 overflow-hidden flex flex-col transform transition-all duration-300 relative font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="cad-corner cad-tl" />
        <span className="cad-corner cad-tr" />
        <span className="cad-corner cad-bl" />
        <span className="cad-corner cad-br" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2b2f33] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#1b1b1f] border border-[#cfc6b0]/40 flex items-center justify-center text-[#00f0ff] flex-shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-normal text-[#FAF8F5] font-space tracking-tight">
                Audio Matrix & Sovereign Relays
              </h3>
              <p className="text-[11px] text-[#8f918c]">
                Decentralized lossless carriers, high-bitrate spectral nodes, and custom streams
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] border border-[#2b2f33] hover:border-[#cfc6b0]/50 text-[#8f918c] hover:text-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Selector Badges */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-[6px] text-[10px] uppercase tracking-[0.14em] whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-[#232529] border-[#cfc6b0]/60 text-[#FAF8F5] font-semibold'
                  : 'bg-[#1b1b1f] hover:bg-[#232529] border-[#2b2f33] text-[#8f918c] hover:text-[#FAF8F5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative flex items-center flex-shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[#8f918c] pointer-events-none" />
          <input
            type="text"
            placeholder="Filter carrier nodes, frequency spectrums, or relays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d0e11] text-[#FAF8F5] placeholder-[#8f918c] text-xs rounded-[8px] pl-9 pr-3 py-2 outline-none border border-[#2b2f33] focus:border-[#cfc6b0]/50 font-mono"
          />
        </div>

        {/* Source List */}
        <div className="mt-3 space-y-2 flex-1 overflow-y-auto pr-1 custom-scroll min-h-[220px]">
          {filteredSources.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-[#8f918c]">
              [ NO CARRIER RELAYS MATCHING "{searchQuery}" ]
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
        <div className="mt-3 pt-3 border-t border-[#cfc6b0]/15 flex-shrink-0">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2 px-3 wireframe-btn text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#cfc6b0]" />
              <span>Connect Custom Icecast / Sovereign Matrix Stream URL</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#FAF8F5]/80">
                <span>Direct Audio URL Handoff</span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-[#FAF8F5]/40 hover:text-[#FAF8F5] text-[10px] font-mono cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Stream Alias (e.g. Observatory Private Relay)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#18191d] text-[#FAF8F5] placeholder-[#FAF8F5]/40 text-xs px-3 py-2 outline-none border border-[#cfc6b0]/25 focus:border-[#cfc6b0] font-mono"
              />
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://stream.matrix.org/lossless.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-[#18191d] text-[#FAF8F5] placeholder-[#FAF8F5]/40 text-xs px-3 py-2 outline-none border border-[#cfc6b0]/25 focus:border-[#cfc6b0] font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 wireframe-btn-cyan text-xs font-bold cursor-pointer"
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
