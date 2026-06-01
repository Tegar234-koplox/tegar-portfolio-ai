import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/pricing/schema';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendContactNotification } from '@/lib/email/resend';
import { getClientIp, getRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit';
import { checkContactSpam } from '@/lib/security/spam';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 10 * 60_000 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak pesan. Coba lagi beberapa menit lagi.' },
      { status: 429, headers: getRateLimitHeaders(limit) },
    );
  }

  try {
    const payload = await request.json();
    const spamCheck = checkContactSpam(payload);

    if (spamCheck.isSpam) {
      return NextResponse.json(
        { error: 'Pesan ditolak karena terdeteksi sebagai spam.' },
        { status: 400, headers: getRateLimitHeaders(limit) },
      );
    }

    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Periksa kembali input form.', details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: getRateLimitHeaders(limit) },
      );
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.' },
        { status: 500, headers: getRateLimitHeaders(limit) },
      );
    }

    const { error } = await supabase.from('contacts').insert({
      ...parsed.data,
      spam_score: spamCheck.score,
      spam_reasons: spamCheck.reasons,
      user_agent: request.headers.get('user-agent'),
      ip_hash: ip === 'unknown' ? null : await hashIp(ip),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: getRateLimitHeaders(limit) });
    }

    const emailResult = await sendContactNotification(parsed.data);

    return NextResponse.json(
      {
        message: emailResult.ok
          ? 'Pesan berhasil dikirim.'
          : 'Pesan tersimpan, tetapi email notifikasi gagal dikirim. Periksa konfigurasi email.',
      },
      { headers: getRateLimitHeaders(limit) },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500, headers: getRateLimitHeaders(limit) });
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
