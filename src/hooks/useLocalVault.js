import { useState, useEffect, useCallback } from 'react';

const VAULT_STORAGE_KEY = 'viberr_local_vault';
const PLAYLISTS_STORAGE_KEY = 'viberr_local_playlists';
const HISTORY_STORAGE_KEY = 'viberr_listening_history';
const NODE_ID_KEY = 'viberr_node_id';

// Default starter playlists for new users to immediately see the potential
const DEFAULT_CRATES = [
  {
    id: 'crate_dhh_essentials',
    name: 'DHH Heavy Rotation',
    description: 'Subcontinental underground raw tapes and midnight drives.',
    color: '#00f0ff',
    createdAt: 1710000000000,
    tracks: [
      {
        id: 'yt_W_gunna',
        title: 'W (feat. Gunna)',
        artist: 'Karan Aujla, Gunna',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        duration: 198,
        url: '',
        videoId: '',
        isYouTubeEngine: false
      }
    ]
  },
  {
    id: 'crate_night_drift',
    name: 'Nocturne Drift 3AM',
    description: 'Analog Phonk, tape saturation, and binaural night codes.',
    color: '#cfc6b0',
    createdAt: 1710000001000,
    tracks: []
  }
];

// Helper to generate a friendly anonymous client identity
function getOrCreateNodeId() {
  try {
    let id = localStorage.getItem(NODE_ID_KEY);
    if (!id) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      id = `VBR-NODE-${rand}`;
      localStorage.setItem(NODE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'VBR-NODE-7720';
  }
}

/**
 * useLocalVault
 * Comprehensive Client-Side Music Management Engine (Zero-Auth Required):
 * - My Vault (Wishlist / Liked Songs)
 * - Custom Crates (Playlists with reordering, cover color, and track management)
 * - Listening History (Automatic 30-track rolling cache)
 * - Zero-Backend URL Playlist Sharing (Base64 URL Encoding)
 * - Portable JSON Archive Backup & Restore
 */
export function useLocalVault() {
  const [nodeId] = useState(getOrCreateNodeId);

  // 1. Vault / Liked Tracks State
  const [vaultTracks, setVaultTracks] = useState(() => {
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // 2. Custom Playlists ("Crates") State
  const [playlists, setPlaylists] = useState(() => {
    try {
      const raw = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_CRATES;
    } catch (e) {
      return DEFAULT_CRATES;
    }
  });

  // 3. Listening History State (rolling 30 tracks)
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Auto-sync Vault
  useEffect(() => {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vaultTracks));
    } catch (e) {}
  }, [vaultTracks]);

  // Auto-sync Playlists
  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch (e) {}
  }, [playlists]);

  // Auto-sync History
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  /* ==========================================================================
     VAULT (LIKED SONGS / WISHLIST) METHODS
     ========================================================================== */

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

  /* ==========================================================================
     CUSTOM CRATES (PLAYLISTS) METHODS
     ========================================================================== */

  const createPlaylist = useCallback((name, description = '', color = '#00f0ff') => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;

    const newCrate = {
      id: `crate_${Date.now()}`,
      name: trimmed,
      description: description.trim() || 'Curated personal audio frequency.',
      color: color || '#00f0ff',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tracks: []
    };

    setPlaylists((prev) => [newCrate, ...prev]);
    return newCrate;
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  }, []);

  const renamePlaylist = useCallback((playlistId, name, description) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        return {
          ...p,
          name: name !== undefined ? name.trim() : p.name,
          description: description !== undefined ? description.trim() : p.description,
          updatedAt: Date.now()
        };
      })
    );
  }, []);

  const addTrackToPlaylist = useCallback((playlistId, track) => {
    if (!playlistId || !track) return false;

    let added = false;
    setPlaylists((prev) =>
      prev.map((crate) => {
        if (crate.id !== playlistId) return crate;

        // Check if track is already in this playlist
        const trackId = track.id || track.title;
        const alreadyIn = crate.tracks.some((t) => (t.id && t.id === trackId) || t.title === track.title);
        if (alreadyIn) return crate;

        added = true;
        const normalized = {
          id: track.id || `track_${Date.now()}`,
          title: track.title || 'Untitled Track',
          artist: track.artist || 'Viberr Artist',
          thumbnail: track.thumbnail || '/viberr-icon.svg',
          duration: track.duration || 210,
          url: track.url || '',
          videoId: track.videoId || '',
          isYouTubeEngine: Boolean(track.isYouTubeEngine || track.videoId),
          addedAt: Date.now()
        };

        return {
          ...crate,
          updatedAt: Date.now(),
          tracks: [...crate.tracks, normalized]
        };
      })
    );

    return added;
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((crate) => {
        if (crate.id !== playlistId) return crate;
        return {
          ...crate,
          updatedAt: Date.now(),
          tracks: crate.tracks.filter((t) => t.id !== trackId && t.title !== trackId)
        };
      })
    );
  }, []);

  /* ==========================================================================
     LISTENING HISTORY (RECENT TRANSMISSIONS)
     ========================================================================== */

  const recordHistory = useCallback((track) => {
    if (!track || !track.title) return;

    setHistory((prev) => {
      // Remove duplicate if recently played to push to top
      const filtered = prev.filter((t) => t.title !== track.title);
      const normalized = {
        id: track.id || `hist_${Date.now()}`,
        title: track.title,
        artist: track.artist || 'Viberr Radio',
        thumbnail: track.thumbnail || '/viberr-icon.svg',
        duration: track.duration || 210,
        url: track.url || '',
        videoId: track.videoId || '',
        isYouTubeEngine: Boolean(track.isYouTubeEngine || track.videoId),
        playedAt: Date.now()
      };
      // Keep up to 30 tracks
      return [normalized, ...filtered].slice(0, 30);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {}
  }, []);

  /* ==========================================================================
     ZERO-BACKEND URL PLAYLIST SHARING ENGINE
     ========================================================================== */

  /**
   * Encodes a playlist into a compact URL-safe Base64 string
   */
  const generateShareUrl = useCallback((playlist) => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return null;
    try {
      const payload = {
        n: playlist.name,
        d: playlist.description,
        c: playlist.color || '#00f0ff',
        t: playlist.tracks.map((t) => [
          t.title,
          t.artist || '',
          t.videoId || '',
          t.url || '',
          t.duration || 0,
          t.thumbnail || ''
        ])
      };
      const jsonStr = JSON.stringify(payload);
      // Safe UTF-8 Base64 encoding
      const encoded = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode('0x' + p1)
      ));
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://viberrr.pages.dev';
      return `${origin}/library?share_crate=${encodeURIComponent(encoded)}`;
    } catch (e) {
      console.warn('Failed to generate playlist share URL:', e);
      return null;
    }
  }, []);

  /**
   * Decodes a playlist from an encoded string
   */
  const decodeShareUrl = useCallback((encodedStr) => {
    if (!encodedStr) return null;
    try {
      const decodedJson = decodeURIComponent(
        Array.prototype.map
          .call(atob(decodeURIComponent(encodedStr)), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(decodedJson);
      if (!payload || !payload.n || !Array.isArray(payload.t)) return null;

      return {
        name: payload.n,
        description: payload.d || 'Shared Crate from Viberr Network',
        color: payload.c || '#00f0ff',
        tracks: payload.t.map((t, idx) => ({
          id: `shared_${idx}_${Date.now()}`,
          title: t[0] || 'Unknown Track',
          artist: t[1] || 'Viberr Artist',
          videoId: t[2] || '',
          url: t[3] || '',
          duration: t[4] || 210,
          thumbnail: t[5] || '/viberr-icon.svg',
          isYouTubeEngine: Boolean(t[2])
        }))
      };
    } catch (e) {
      console.warn('Failed to decode shared playlist:', e);
      return null;
    }
  }, []);

  /* ==========================================================================
     PORTABLE JSON ARCHIVE BACKUP & RESTORE
     ========================================================================== */

  const exportFullArchive = useCallback(() => {
    try {
      const archive = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        nodeId,
        stats: {
          vaultCount: vaultTracks.length,
          cratesCount: playlists.length,
          historyCount: history.length
        },
        vaultTracks,
        playlists,
        history
      };

      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `viberr_vault_archive_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.warn('Failed to export full archive:', e);
      return false;
    }
  }, [nodeId, vaultTracks, playlists, history]);

  const importFullArchive = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed) return false;

      // Handle full archive format
      if (parsed.playlists || parsed.vaultTracks) {
        if (Array.isArray(parsed.vaultTracks)) {
          setVaultTracks((prev) => {
            const existingMap = new Map(prev.map((t) => [t.id || t.title, t]));
            parsed.vaultTracks.forEach((t) => {
              if (t && t.title) existingMap.set(t.id || t.title, t);
            });
            return Array.from(existingMap.values());
          });
        }

        if (Array.isArray(parsed.playlists)) {
          setPlaylists((prev) => {
            const existingMap = new Map(prev.map((p) => [p.id, p]));
            parsed.playlists.forEach((p) => {
              if (p && p.name) existingMap.set(p.id || `crate_${Date.now()}`, p);
            });
            return Array.from(existingMap.values());
          });
        }

        if (Array.isArray(parsed.history)) {
          setHistory((prev) => {
            const existingMap = new Map(prev.map((h) => [h.title, h]));
            parsed.history.forEach((h) => {
              if (h && h.title) existingMap.set(h.title, h);
            });
            return Array.from(existingMap.values()).slice(0, 30);
          });
        }
        return true;
      }

      // Handle legacy array of tracks
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

      return false;
    } catch (e) {
      console.warn('Failed to import archive:', e);
      return false;
    }
  }, []);

  return {
    nodeId,
    // Vault
    vaultTracks,
    isLiked,
    toggleLike,
    clearVault,
    vaultCount: vaultTracks.length,
    // Playlists
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    cratesCount: playlists.length,
    // History
    history,
    recordHistory,
    clearHistory,
    // Sharing
    generateShareUrl,
    decodeShareUrl,
    // Backup
    exportFullArchive,
    importFullArchive
  };
}
