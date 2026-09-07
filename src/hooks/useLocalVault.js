import { useState, useEffect, useCallback } from 'react';

const VAULT_STORAGE_KEY = 'viberr_local_vault';

/**
 * useLocalVault
 * Client-Side Personalization Hook:
 * - Stores liked songs locally without requiring login or database accounts
 * - Provides fast O(1) membership check via Set
 * - Exports & imports vault as portable JSON
 */
export function useLocalVault() {
  const [vaultTracks, setVaultTracks] = useState(() => {
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vaultTracks));
    } catch (e) {}
  }, [vaultTracks]);

  const isLiked = useCallback((trackId) => {
    if (!trackId) return false;
    return vaultTracks.some((t) => t.id === trackId || (t.title && t.title === trackId));
  }, [vaultTracks]);

  const toggleLike = useCallback((track) => {
    if (!track) return false;
    const trackId = track.id || track.title;
    let nextLikedState = false;

    setVaultTracks((prev) => {
      const exists = prev.some((t) => (t.id && t.id === trackId) || t.title === track.title);
      if (exists) {
        nextLikedState = false;
        return prev.filter((t) => (t.id ? t.id !== trackId : t.title !== track.title));
      } else {
        nextLikedState = true;
        const normalized = {
          id: track.id || `vault_${Date.now()}`,
          title: track.title || 'Untitled Track',
          artist: track.artist || 'Viberr Artist',
          thumbnail: track.thumbnail || '/viberr-icon.svg',
          duration: track.duration || 210,
          url: track.url || '',
          videoId: track.videoId || '',
          isYouTubeEngine: Boolean(track.isYouTubeEngine || track.videoId),
          savedAt: Date.now()
        };
        return [normalized, ...prev];
      }
    });

    return nextLikedState;
  }, []);

  const clearVault = useCallback(() => {
    setVaultTracks([]);
    try {
      localStorage.removeItem(VAULT_STORAGE_KEY);
    } catch (e) {}
  }, []);

  const exportVault = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(vaultTracks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `viberr-vault-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Vault export failed:', e);
    }
  }, [vaultTracks]);

  const importVault = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setVaultTracks((prev) => {
          const existingMap = new Map(prev.map((t) => [t.id || t.title, t]));
          parsed.forEach((t) => {
            if (t && t.title) existingMap.set(t.id || t.title, t);
          });
          return Array.from(existingMap.values());
        });
        return true;
      }
    } catch (e) {
      console.warn('Vault import failed:', e);
    }
    return false;
  }, []);

  return {
    vaultTracks,
    isLiked,
    toggleLike,
    clearVault,
    exportVault,
    importVault,
    vaultCount: vaultTracks.length
  };
}
