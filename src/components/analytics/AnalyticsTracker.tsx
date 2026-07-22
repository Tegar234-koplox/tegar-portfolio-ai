'use client';

import { useEffect } from 'react';
function createSessionId(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi?.getRandomValues === 'function') {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));

    // UUID v4
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, '0'),
    );

    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join(''),
    ].join('-');
  }

  // Cukup untuk ID analytics, bukan token keamanan.
  return `session-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}
function getSessionId() {
  const key = 'portfolio_session_id';
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const value = createSessionId();
  window.localStorage.setItem(key, value);
  return value;
}

export function AnalyticsTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return;

    const payload = {
      path: window.location.pathname,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
      screen: `${window.screen.width}x${window.screen.height}`,
    };

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', new Blob([body], { type: 'application/json' }));
      return;
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
