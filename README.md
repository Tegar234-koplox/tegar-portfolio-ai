# Tegar Portfolio AI

Portfolio profesional dengan admin panel, chatbot AI estimator harga, proteksi spam, upload foto, email notification, dan analytics sederhana.

## Fitur

- About Me
- Skills
- Pengalaman
- Contact Me
- Gambar diri sendiri `.png`
- Admin panel untuk update profil, foto, skills, dan pengalaman
- Chatbot AI untuk konsultasi tech dan estimasi harga website/mobile app dalam Rupiah
- Rate limit untuk endpoint chatbot, contact form, dan analytics
- Proteksi spam contact form: honeypot, timestamp, URL limit, suspicious term scoring
- Email notification untuk pesan contact via Resend
- Upload foto dari admin panel ke Supabase Storage
- Analytics sederhana untuk traffic: total visits, visits hari ini, recent traffic
- Responsive, elegan, dan siap deploy

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Row Level Security
- Supabase Storage
- OpenAI Responses API
- Resend Email API
- Vercel Deployment
- Git + GitHub

## Struktur folder

```txt
tegar-portfolio-ai/
├── public/
│   └── avatar.png
├── supabase/
│   └── schema.sql
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── analytics/
│   │   │   │   └── track/
│   │   │   │       └── route.ts
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   └── contact/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── analytics/
│   │   │   └── AnalyticsTracker.tsx
│   │   ├── chatbot/
│   │   │   └── Chatbot.tsx
│   │   ├── contact/
│   │   │   └── ContactForm.tsx
│   │   ├── layout/
│   │   ├── sections/
│   │   └── ui/
│   ├── lib/
│   │   ├── data/
│   │   ├── email/
│   │   │   └── resend.ts
│   │   ├── openai/
│   │   ├── pricing/
│   │   │   ├── config.ts
│   │   │   ├── estimate.ts
│   │   │   └── schema.ts
│   │   ├── security/
│   │   │   ├── rate-limit.ts
│   │   │   └── spam.ts
│   │   ├── supabase/
│   │   └── utils.ts
│   └── types/
│       └── portfolio.ts
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Setup lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## Setup Supabase

1. Buat project di Supabase.
2. Buka SQL Editor.
3. Jalankan isi file `supabase/schema.sql`.
4. Buka Authentication → Users.
5. Buat user admin dengan email dan password milikmu.
6. Jalankan SQL berikut untuk menjadikan user tersebut admin:

```sql
insert into public.app_admins (user_id, email)
select id, email from auth.users
where email = 'email-kamu@example.com';
```

7. Ambil `Project URL` dan `anon key`, lalu isi ke `.env.local`.

Schema sudah membuat:

- tabel `profiles`
- tabel `skills`
- tabel `experiences`
- tabel `contacts`
- tabel `chat_logs`
- tabel `page_views`
- bucket storage `portfolio-assets`
- RLS policy untuk public read dan admin-only update

## Setup OpenAI

Isi `.env.local`:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

Jika `OPENAI_API_KEY` belum diisi, chatbot tetap berjalan memakai rule-based estimator lokal.

## Setup email notification

Project ini memakai Resend melalui `fetch`, jadi tidak perlu dependency tambahan.

Isi `.env.local`:

```env
RESEND_API_KEY=your-resend-api-key
CONTACT_NOTIFICATION_TO=email-tujuan@example.com
CONTACT_NOTIFICATION_FROM=Portfolio Contact <onboarding@resend.dev>
```

Catatan:

- Untuk testing awal, `onboarding@resend.dev` bisa dipakai sesuai batasan Resend.
- Untuk produksi, gunakan domain email sendiri agar terlihat profesional.
- Jika `RESEND_API_KEY` atau `CONTACT_NOTIFICATION_TO` kosong, pesan tetap tersimpan di database tetapi email notifikasi dilewati.

## Upload foto dari admin panel

1. Login ke `/admin/login`.
2. Masuk ke `/admin`.
3. Upload foto pada section `Profil & Foto`.
4. File akan masuk ke Supabase Storage bucket `portfolio-assets`.
5. URL publik akan disimpan ke tabel `profiles.photo_url`.

Batas file:

- PNG/JPG/WEBP
- Maksimal 3MB

## Rate limit

Rate limit saat ini memakai in-memory Map:

| Endpoint | Limit |
|---|---:|
| `/api/chat` | 12 request / menit / IP |
| `/api/contact` | 5 request / 10 menit / IP |
| `/api/analytics/track` | 60 request / menit / IP |

Ini cukup untuk starter project dan demo portfolio. Untuk produksi dengan traffic tinggi, ganti ke Redis/Upstash supaya konsisten antar serverless instance.

## Proteksi spam contact form

Contact form memiliki:

- honeypot field tersembunyi `company`
- timestamp `formStartedAt`
- penolakan submit terlalu cepat
- pembatasan URL berlebihan
- deteksi karakter berulang
- suspicious terms scoring
- rate limit per IP

Data spam score disimpan di tabel `contacts`.

## Pricing engine

AI tidak menentukan harga secara bebas. AI hanya menganalisis:

- jenis project
- kompleksitas
- fitur yang terdeteksi
- pertanyaan lanjutan

Harga dihitung oleh pricing engine lokal di:

```txt
src/lib/pricing/config.ts
src/lib/pricing/estimate.ts
```

Pricing matrix memiliki:

- base price per jenis project
- base price per kompleksitas
- feature multiplier
- complexity points
- minimum price impact
- matrix validation

Ini membuat estimasi lebih konsisten, bisa diaudit, dan mudah kamu ubah sesuai strategi harga freelance.

## Analytics sederhana

Analytics berjalan otomatis dari component:

```txt
src/components/analytics/AnalyticsTracker.tsx
```

Data masuk ke:

```txt
public.page_views
```

Yang disimpan:

- path halaman
- referrer
- session ID acak
- screen size
- user agent
- hash IP, bukan IP mentah
- created_at

Dashboard admin menampilkan:

- total visits
- visits hari ini
- total contact messages
- recent traffic

## Deployment ke Vercel

1. Push project ke GitHub.
2. Import repository di Vercel.
3. Isi Environment Variables dari `.env.example`.
4. Deploy.
5. Hubungkan custom domain kalau sudah punya domain pribadi.

## Catatan arsitektur penting

Project ini sudah layak untuk portfolio profesional karena menunjukkan:

- frontend responsif
- backend API
- database relational
- authentication
- RLS security
- file storage
- AI integration
- pricing engine
- contact workflow
- email notification
- analytics
- deployment readiness

Yang masih perlu ditingkatkan untuk produksi serius:

- Redis-based rate limit
- CAPTCHA opsional untuk contact form
- audit log admin
- pagination untuk contacts/chat logs/page views
- role management lebih detail
- unit test untuk pricing engine
