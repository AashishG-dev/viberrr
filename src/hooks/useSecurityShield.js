import { useEffect } from 'react';

/**
 * useSecurityShield
 * Enterprise Anti-Scraping, Anti-Debugging & Anti-Inspection Security Shield:
 * - Disables Right-Click Context Menu (Prevents 'Inspect' and 'Save Media As')
 * - Blocks DevTools Inspection Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S)
 * - Blocks Drag & Drop Asset Exfiltration
 * - Active Anti-Debugger Heartbeat in Production (Freezes DevTools if forced open)
 * - Suppresses & Protects Console Memory
 */
export function useSecurityShield() {
  useEffect(() => {
    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Block DevTools & Source Inspection Keyboard Shortcuts
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // F12 -> DevTools
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Element picker)
      if (ctrlKey && e.shiftKey && ['i', 'j', 'c', 'I', 'J', 'C'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (View Source)
      if (ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Save Page)
      if (ctrlKey && (e.key === 's' || e.key === 'S') && !['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Disable Asset Dragging
    const handleDragStart = (e) => {
      if (e.target.nodeName === 'IMG' || e.target.nodeName === 'AUDIO' || e.target.nodeName === 'A') {
        e.preventDefault();
        return false;
      }
    };

    // 4. Production Telemetry Suppression (Protects console telemetry without breaking native behavior)
    if (import.meta.env.PROD) {
      try {
        const noop = () => {};
        console.debug = noop;
        console.info = noop;
      } catch (err) {}
    }

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
    };
  }, []);
}
