import { useEffect, useRef } from 'react';

export function useWakeLock(isActive = true) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    let released = false;

    async function requestWakeLock() {
      if ('wakeLock' in navigator && isActive && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        } catch (err) {
          // Wake lock request failed (e.g. low battery mode)
        }
      }
    }

    if (isActive) {
      requestWakeLock();
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      }).catch(() => {});
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isActive]);
}
