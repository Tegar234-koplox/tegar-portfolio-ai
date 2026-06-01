'use client';

import { useEffect } from 'react';

function getSessionId() {
  const key = 'portfolio_session_id';
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const value = crypto.randomUUID();
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
