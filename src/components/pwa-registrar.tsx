'use client';

import React, { useEffect } from 'react';

// Registers the minimal pass-through service worker so browsers treat the
// app as installable (home-screen icon, standalone window). The SW itself
// never caches, so behavior is identical to a non-PWA build.
export function PWARegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Non-fatal: app works identically without the SW.
      });
    };

    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
