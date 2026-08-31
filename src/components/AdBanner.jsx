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
  const adContainerRef = useRef(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  // If no adsterraKey is provided yet, don't show any placeholder
  const hasConfiguredAd = Boolean(adsterraKey && adsterraKey.trim());

  useEffect(() => {
    if (!isVisible || !hasConfiguredAd) {
      setIsAdLoaded(false);
      return;
    }

    // Strict validation: Ad zone keys must be strictly alphanumeric/underscore/dash
    const sanitizedKey = String(adsterraKey || '').trim();
    const isValidZoneKey = /^[a-zA-Z0-9_-]{4,64}$/.test(sanitizedKey);

    if (!isValidZoneKey) {
      setIsAdLoaded(false);
      return;
    }

    // Attempt to load the real ad in the background
    try {
      const container = adContainerRef.current;
      if (!container) return;
      container.innerHTML = '';

      // Create native container div required by Adsterra
      const innerTargetDiv = document.createElement('div');
      innerTargetDiv.id = `container-${sanitizedKey}`;
      innerTargetDiv.className = 'w-full flex items-center justify-center';
      container.appendChild(innerTargetDiv);

      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.async = true;
      adScript.setAttribute('data-cfasync', 'false');
      adScript.src = `https://pl31110848.profitableratecpmnetwork.com/${encodeURIComponent(sanitizedKey)}/invoke.js`;

      let checkInterval = null;

      const verifyRealAdLoaded = () => {
        // Only mark as loaded if real ad elements (iframe, img, a, canvas) are rendered with actual height
        const hasAdElements = innerTargetDiv.querySelector('iframe, a, img, svg') !== null;
        const hasHeight = innerTargetDiv.offsetHeight > 15 || container.offsetHeight > 15;
        if (hasAdElements || hasHeight) {
          setIsAdLoaded(true);
          if (checkInterval) clearInterval(checkInterval);
        }
      };

      adScript.onload = () => {
        // Poll for 3 seconds to check if ad actually renders
        let attempts = 0;
        checkInterval = setInterval(() => {
          attempts++;
          verifyRealAdLoaded();
          if (attempts > 12) {
            clearInterval(checkInterval);
          }
        }, 250);
      };

      adScript.onerror = () => {
        setIsAdLoaded(false);
      };

      container.appendChild(adScript);

      return () => {
        if (checkInterval) clearInterval(checkInterval);
        if (container) {
          container.innerHTML = '';
        }
      };
    } catch (e) {
      setIsAdLoaded(false);
    }
  }, [isVisible, hasConfiguredAd, adsterraKey, adCycleId]);

  // Only show when ad is active, user configured a key, and real ad is loaded in background
  if (!isVisible || !hasConfiguredAd || !isAdLoaded) {
    // Hidden container in DOM to let the ad preload silently in background
    return (
      <div 
        ref={adContainerRef} 
        className="hidden pointer-events-none opacity-0 invisible" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.aside
        key={`ad-banner-${adCycleId}`}
        initial={{ opacity: 0, y: -18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.95 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[92vw] sm:max-w-2xl w-auto"
        aria-label="Sponsored advertisement"
      >
        <div className="glass-panel rounded-2xl p-2 sm:p-2.5 border border-white/20 shadow-2xl backdrop-blur-2xl flex flex-col items-center relative overflow-hidden group">
          
          {/* Smooth Countdown Progress Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-white/60"
              style={{ width: `${100 - progressPercent}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>

          {/* Top Bar: Sponsor Label + Auto-Close Countdown + Close Button */}
          <div className="w-full flex items-center justify-between gap-3 px-1.5 pb-1.5 pt-0.5 border-b border-white/10 text-[10px] font-mono text-white/50">
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

          {/* Real Adsterra Ad Unit */}
          <div className="w-full flex items-center justify-center min-h-[50px] sm:min-h-[60px] py-1.5 px-2">
            <div 
              ref={adContainerRef} 
              className="w-full flex items-center justify-center overflow-hidden" 
            />
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
