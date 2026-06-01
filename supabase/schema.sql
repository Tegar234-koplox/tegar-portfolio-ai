create extension if not exists pgcrypto;

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  headline text not null,
  about text not null,
  photo_url text,
  cv_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level integer not null check (level between 1 and 100),
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  type text not null default 'Work',
  start_date date not null,
  end_date date,
  description text not null,
  tech_stack text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  spam_score integer not null default 0,
  spam_reasons text[] not null default '{}',
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.contacts add column if not exists spam_score integer not null default 0;
alter table public.contacts add column if not exists spam_reasons text[] not null default '{}';
alter table public.contacts add column if not exists user_agent text;
alter table public.contacts add column if not exists ip_hash text;

create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_message text not null,
  ai_response text not null,
  estimated_price_min integer,
  estimated_price_max integer,
  complexity_level text,
  project_type text,
  detected_features text[] not null default '{}',
  multiplier_total numeric(8, 2),
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.chat_logs add column if not exists project_type text;
alter table public.chat_logs add column if not exists detected_features text[] not null default '{}';
alter table public.chat_logs add column if not exists multiplier_total numeric(8, 2);
alter table public.chat_logs add column if not exists user_agent text;
alter table public.chat_logs add column if not exists ip_hash text;

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  session_id text,
  screen text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists chat_logs_created_at_idx on public.chat_logs (created_at desc);

create or replace function public.is_app_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = auth.uid()
  );
$$;

alter table public.app_admins enable row level security;
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.contacts enable row level security;
alter table public.chat_logs enable row level security;
alter table public.page_views enable row level security;

drop policy if exists "Admins can read app admins" on public.app_admins;
create policy "Admins can read app admins"
on public.app_admins for select
to authenticated
using (public.is_app_admin());

drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "Public can read skills" on public.skills;
create policy "Public can read skills"
on public.skills for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage skills" on public.skills;
create policy "Admins can manage skills"
on public.skills for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "Public can read experiences" on public.experiences;
create policy "Public can read experiences"
on public.experiences for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage experiences" on public.experiences;
create policy "Admins can manage experiences"
on public.experiences for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "Anyone can insert contact messages" on public.contacts;
create policy "Anyone can insert contact messages"
on public.contacts for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read contact messages" on public.contacts;
create policy "Admins can read contact messages"
on public.contacts for select
to authenticated
using (public.is_app_admin());

drop policy if exists "Anyone can insert chat logs" on public.chat_logs;
create policy "Anyone can insert chat logs"
on public.chat_logs for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read chat logs" on public.chat_logs;
create policy "Admins can read chat logs"
on public.chat_logs for select
to authenticated
using (public.is_app_admin());

drop policy if exists "Anyone can insert page views" on public.page_views;
create policy "Anyone can insert page views"
on public.page_views for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read page views" on public.page_views;
create policy "Admins can read page views"
on public.page_views for select
to authenticated
using (public.is_app_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-assets', 'portfolio-assets', true, 3145728, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = 3145728,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "Public can read portfolio assets" on storage.objects;
create policy "Public can read portfolio assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-assets');

drop policy if exists "Admins can upload portfolio assets" on storage.objects;
create policy "Admins can upload portfolio assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio-assets' and public.is_app_admin());

drop policy if exists "Admins can update portfolio assets" on storage.objects;
create policy "Admins can update portfolio assets"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio-assets' and public.is_app_admin())
with check (bucket_id = 'portfolio-assets' and public.is_app_admin());

drop policy if exists "Admins can delete portfolio assets" on storage.objects;
create policy "Admins can delete portfolio assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio-assets' and public.is_app_admin());

insert into public.profiles (name, headline, about, photo_url)
select
  'Tegar Sang Putra',
  'Full Stack Developer | UI/UX Enthusiast | Area Supervisor',
  'Saya membangun website, aplikasi berbasis web, dan antarmuka digital yang rapi, responsif, serta berorientasi pada kebutuhan bisnis. Fokus saya adalah menggabungkan pemahaman operasional, desain, dan engineering agar solusi yang dibuat bukan hanya menarik, tetapi juga berguna.',
  '/avatar.png'
where not exists (select 1 from public.profiles);

do $$
begin
  if not exists (select 1 from public.skills) then
    insert into public.skills (name, category, level, sort_order)
    values
      ('HTML', 'Frontend', 90, 1),
      ('CSS', 'Frontend', 88, 2),
      ('JavaScript', 'Frontend', 82, 3),
      ('TypeScript', 'Frontend', 75, 4),
      ('React', 'Frontend', 78, 5),
      ('Next.js', 'Full Stack', 76, 6),
      ('PHP', 'Backend', 78, 7),
      ('Laravel', 'Backend', 74, 8),
      ('MySQL / PostgreSQL', 'Database', 76, 9),
      ('UI/UX Design', 'Design', 84, 10);
  end if;

  if not exists (select 1 from public.experiences) then
    insert into public.experiences (title, company, type, start_date, end_date, description, tech_stack, sort_order)
    values
      (
        'Full Stack Web Developer',
        'Project Portfolio',
        'Project',
        '2024-01-01',
        null,
        'Membangun sistem inventory dan cost control untuk kebutuhan restoran, mencakup pengelolaan stok, transfer barang antar cabang, riwayat transaksi, dan dashboard operasional.',
        array['PHP', 'MySQL', 'JavaScript', 'Bootstrap'],
        1
      ),
      (
        'Frontend Developer & UI/UX Designer',
        'PT Imersa Solusi Teknologi',
        'Internship',
        '2025-01-01',
        '2025-06-01',
        'Merancang dan mengimplementasikan website company profile menggunakan pendekatan UI/UX yang rapi, responsif, dan mudah dipahami pengguna.',
        array['Laravel', 'Blade', 'Bootstrap', 'Figma'],
        2
      );
  end if;
end $$;
