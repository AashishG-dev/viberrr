import { useState, useEffect, useRef, useCallback } from 'react';

const AD_DISPLAY_SECONDS = 15; // Ad stays visible for 15 seconds before auto-closing
const AD_COOLDOWN_SECONDS = 120; // 2 minutes cooldown before fresh ad reappears

/**
 * useAdManager
 * Dynamic Smart Ad Lifecycle Manager:
 * - Auto-closes ad after 15 seconds with real-time countdown
 * - Allows immediate manual dismiss via [X]
 * - Periodically re-triggers fresh ad impressions after cooldown (2 mins)
 */
export function useAdManager() {
  const [isAdVisible, setIsAdVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(AD_DISPLAY_SECONDS);
  const [adCycleId, setAdCycleId] = useState(1);

  const countdownTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  // Auto-close countdown handler when ad becomes visible
  useEffect(() => {
    if (isAdVisible) {
      setTimeRemaining(AD_DISPLAY_SECONDS);

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            dismissAd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isAdVisible, adCycleId]);

  // Dismiss ad & schedule next dynamic ad appearance
  const dismissAd = useCallback(() => {
    setIsAdVisible(false);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Schedule next fresh ad appearance after cooldown
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setAdCycleId((prev) => prev + 1);
      setIsAdVisible(true);
    }, AD_COOLDOWN_SECONDS * 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const progressPercent = ((AD_DISPLAY_SECONDS - timeRemaining) / AD_DISPLAY_SECONDS) * 100;

  return {
    isAdVisible,
    timeRemaining,
    progressPercent,
    adCycleId,
    dismissAd
  };
}
