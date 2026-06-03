# Patch: Proyek Unggulan + Dark/Light Theme

Patch ini menambahkan:

1. Section `Proyek Unggulan`
2. Data project static di `src/lib/data/featured-projects.ts`
3. Folder asset project di `public/projects`
4. Theme toggle light/dark di navbar
5. Tailwind dark mode berbasis class
6. Update komponen UI dasar agar support dark mode

## Cara pasang

1. Backup/commit project kamu dulu.
2. Copy isi folder patch ini ke root project `tegar-portfolio-ai`.
3. Izinkan replace file jika diminta.
4. Jalankan:

```powershell
npm run build
```

5. Kalau sukses:

```powershell
git add .
git commit -m "Add featured projects and dark light theme"
git push
```

## File yang ditambahkan

- `src/types/featured-project.ts`
- `src/lib/data/featured-projects.ts`
- `src/components/sections/FeaturedProjectsSection.tsx`
- `src/components/theme/ThemeToggle.tsx`
- `public/projects/**`

## File yang direplace/update

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/sections/AboutSection.tsx`
- `src/components/sections/ExperienceSection.tsx`
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/SkillsSection.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Textarea.tsx`
- `tailwind.config.ts`

## Update konten proyek

Edit file:

```txt
src/lib/data/featured-projects.ts
```

Ganti gambar/PDF placeholder di:

```txt
public/projects/ai-portfolio/
public/projects/stock-redesign/
```

## Catatan

- Fitur ini tidak membutuhkan tabel baru di Supabase.
- Dark/light theme disimpan di `localStorage` browser user.
- Jika kamu sudah mengubah teks Hero sebelumnya, cek ulang `src/components/sections/HeroSection.tsx` setelah copy patch.
