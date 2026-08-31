import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAdManager
 * Ad Lifecycle Manager:
 * - Keeps ads visible until user manually closes them with [X] (no auto-close)
 * - Injects Desktop Social Bar placement for maximum monetization
 * - Re-triggers fresh impression cycle when user navigates or after cooldown
 */
export function useAdManager() {
  const [isAdVisible, setIsAdVisible] = useState(true);
  const [adCycleId, setAdCycleId] = useState(1);
  const cooldownTimerRef = useRef(null);

  // Inject Social Bar Ad script for desktop monetization
  useEffect(() => {
    try {
      const socialScriptId = 'adsterra-social-bar-script';
      if (!document.getElementById(socialScriptId)) {
        const socialScript = document.createElement('script');
        socialScript.id = socialScriptId;
        socialScript.type = 'text/javascript';
        socialScript.src = 'https://pl31110849.profitableratecpmnetwork.com/b8/40/41/b840417e8728ef3394eaf4e353bb95e9.js';
        socialScript.async = true;
        socialScript.setAttribute('data-cfasync', 'false');
        document.body.appendChild(socialScript);
      }
    } catch (e) {}
  }, []);

  // Dismiss ad manually via [X]
  const dismissAd = useCallback(() => {
    setIsAdVisible(false);

    // Schedule next ad cycle after 3 minutes cooldown
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setAdCycleId((prev) => prev + 1);
      setIsAdVisible(true);
    }, 180 * 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  return {
    isAdVisible,
    adCycleId,
    dismissAd
  };
}

