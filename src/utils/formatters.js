// Utility helper functions

export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function getStoredLikes() {
  try {
    const data = localStorage.getItem('viberr_likes');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export function toggleTrackLike(trackId) {
  try {
    const likes = getStoredLikes();
    const isLiked = !!likes[trackId];
    if (isLiked) {
      delete likes[trackId];
    } else {
      likes[trackId] = true;
    }
    localStorage.setItem('viberr_likes', JSON.stringify(likes));
    return !isLiked;
  } catch (e) {
    return false;
  }
}

export function isTrackLiked(trackId) {
  const likes = getStoredLikes();
  return !!likes[trackId];
}

export function isUserSupporter() {
  try {
    return localStorage.getItem('viberr_has_supported') === 'true';
  } catch (e) {
    return false;
  }
}

export function setUserSupporter(value = true) {
  try {
    if (value) {
      localStorage.setItem('viberr_has_supported', 'true');
    } else {
      localStorage.removeItem('viberr_has_supported');
    }
  } catch (e) {}
}

export async function copyShareLink(stationSlug = '') {
  const url = stationSlug 
    ? `${window.location.origin}${window.location.pathname}?station=${encodeURIComponent(stationSlug)}`
    : window.location.href;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (e) {}
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Security: Validates and sanitizes stream audio URLs.
 * Rejects javascript:, data:, vbscript:, private/loopback IPs, and malicious schemes.
 */
export function sanitizeAudioUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost, loopback, and local domain names
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local')
    ) {
      return '';
    }

    // Block private / link-local / cloud metadata IPv4 ranges
    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const b1 = parseInt(ipMatch[1], 10);
      const b2 = parseInt(ipMatch[2], 10);
      if (
        b1 === 0 ||
        b1 === 10 || // 10.0.0.0/8
        b1 === 127 || // 127.0.0.0/8
        (b1 === 172 && b2 >= 16 && b2 <= 31) || // 172.16.0.0/12
        (b1 === 192 && b2 === 168) || // 192.168.0.0/16
        (b1 === 169 && b2 === 254) // 169.254.0.0/16 Link-local / Cloud metadata
      ) {
        return '';
      }
    }

    return parsed.href;
  } catch (e) {
    // Invalid URL format
  }
  return '';
}

/**
 * Security: Sanitizes user-provided text to prevent HTML/script injection
 */
export function sanitizeInputText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/[<>'"&]/g, '')
    .trim()
    .slice(0, 80);
}

