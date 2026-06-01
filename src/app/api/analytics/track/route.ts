import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClientIp, getRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit';

const analyticsPayloadSchema = z.object({
  path: z.string().min(1).max(300),
  referrer: z.string().max(700).nullable().optional(),
  sessionId: z.string().min(8).max(120).optional(),
  screen: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit({ key: `analytics:${ip}`, limit: 60, windowMs: 60_000 });

  if (!limit.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak request analytics.' }, { status: 429, headers: getRateLimitHeaders(limit) });
  }

  try {
    const payload = analyticsPayloadSchema.parse(await request.json());
    const supabase = createServerSupabaseClient();

    if (supabase) {
      await supabase.from('page_views').insert({
        path: payload.path,
        referrer: payload.referrer ?? null,
        session_id: payload.sessionId ?? null,
        screen: payload.screen ?? null,
        user_agent: request.headers.get('user-agent'),
        ip_hash: ip === 'unknown' ? null : await hashIp(ip),
      });
    }

    return NextResponse.json({ ok: true }, { headers: getRateLimitHeaders(limit) });
  } catch {
    return NextResponse.json({ error: 'Payload analytics tidak valid.' }, { status: 400, headers: getRateLimitHeaders(limit) });
  }
}

async function hashIp(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${value}:${process.env.ANALYTICS_SALT ?? 'local-dev'}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
