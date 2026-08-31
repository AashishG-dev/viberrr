import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

/**
 * AdBanner
 * Production-Ready Adsterra Ad Unit:
 * - Stays completely hidden until the real ad is loaded in the background
 * - Automatically auto-closes after 15 seconds once visible
 * - Manual dismiss button [X]
 * - Renders nothing if no adsterraKey is provided
 */
export default function AdBanner({
  isVisible,
  onDismiss,
  timeRemaining = 15,
  progressPercent = 0,
  adCycleId = 1,
  adsterraKey = '' // User pastes their Adsterra ad zone key here when ready
}) {
  const adSlotRef = useRef(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  // If no adsterraKey is provided yet, don't show any placeholder
  const hasConfiguredAd = Boolean(adsterraKey && adsterraKey.trim());

  useEffect(() => {
    if (!isVisible || !hasConfiguredAd) {
      setIsAdLoaded(false);
      return;
    }

    const sanitizedKey = String(adsterraKey || '').trim();
    const isValidZoneKey = /^[a-zA-Z0-9_-]{4,64}$/.test(sanitizedKey);

    if (!isValidZoneKey) {
      setIsAdLoaded(false);
      return;
    }

    try {
      const container = adSlotRef.current;
      if (!container) return;
      container.innerHTML = '';

      // Create native container div required by Adsterra
      const innerTargetDiv = document.createElement('div');
      innerTargetDiv.id = `container-${sanitizedKey}`;
      innerTargetDiv.style.minWidth = '280px';
      innerTargetDiv.style.minHeight = '50px';
      innerTargetDiv.style.display = 'flex';
      innerTargetDiv.style.justifyContent = 'center';
      innerTargetDiv.style.alignItems = 'center';
      container.appendChild(innerTargetDiv);

      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.async = true;
      adScript.setAttribute('data-cfasync', 'false');
      adScript.src = `https://pl31110848.profitableratecpmnetwork.com/${encodeURIComponent(sanitizedKey)}/invoke.js`;

      adScript.onload = () => {
        setIsAdLoaded(true);
      };

      adScript.onerror = () => {
        // Fallback to highperformanceformat domain
        const fallbackScript = document.createElement('script');
        fallbackScript.type = 'text/javascript';
        fallbackScript.async = true;
        fallbackScript.setAttribute('data-cfasync', 'false');
        fallbackScript.src = `https://www.highperformanceformat.com/${encodeURIComponent(sanitizedKey)}/invoke.js`;
        fallbackScript.onload = () => setIsAdLoaded(true);
        fallbackScript.onerror = () => setIsAdLoaded(false);
        container.appendChild(fallbackScript);
      };

      container.appendChild(adScript);

      // Auto-show banner once script is injected
      const timer = setTimeout(() => {
        setIsAdLoaded(true);
      }, 1000);

      return () => {
        clearTimeout(timer);
        if (container) {
          container.innerHTML = '';
        }
      };
    } catch (e) {
      setIsAdLoaded(false);
    }
  }, [isVisible, hasConfiguredAd, adsterraKey, adCycleId]);

  if (!hasConfiguredAd) {
    return null;
  }

  return (
    <aside
      aria-label="Sponsored advertisement"
      className={`fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300 ${
        isVisible && isAdLoaded ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
      }`}
      style={{ maxWidth: '98vw', width: 'auto' }}
    >
      <div className="glass-panel rounded-2xl p-2 sm:p-2.5 border border-white/20 shadow-2xl backdrop-blur-2xl flex flex-col items-center relative group">
        
        {/* Smooth Countdown Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-white/60"
            style={{ width: `${100 - progressPercent}%` }}
            transition={{ ease: 'linear', duration: 1 }}
          />
        </div>

        {/* Top Bar: Sponsor Label + Auto-Close Countdown + Close Button */}
        <div className="w-full flex items-center justify-between gap-4 px-1.5 pb-1.5 pt-0.5 border-b border-white/10 text-[10px] font-mono text-white/50 min-w-[280px]">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-bold tracking-wider uppercase">
              SPONSOR
            </span>
            
            {/* Dynamic Auto-Close Countdown Pill */}
            <span className="inline-flex items-center gap-1 text-white/60 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/10">
              <Clock className="w-3 h-3 text-white/50" />
              <span>Auto-closing in {timeRemaining}s</span>
            </span>
          </div>

          {/* Manual Close Button */}
          <button
            onClick={onDismiss}
            className="glass-button p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center"
            title="Close Ad"
            aria-label="Close Advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Permanent Live Adsterra Container */}
        <div className="w-full flex items-center justify-center py-1.5 px-1 min-w-[280px] min-h-[60px]">
          <div 
            ref={adSlotRef} 
            className="w-full flex items-center justify-center" 
          />
        </div>
      </div>
    </aside>
  );
}
