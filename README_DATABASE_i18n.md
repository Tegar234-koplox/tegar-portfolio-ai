# Database Content Translation

Fitur translate website memakai dua jalur yang sengaja dipisahkan:

1. **Static dictionary** di `src/lib/i18n/dictionary.ts` untuk teks UI statis seperti navbar, tombol, heading section, form, dan sapaan chatbot.
2. **Database bilingual fields** untuk konten yang berasal dari Supabase seperti profile, skills, dan experiences.

Dengan pemisahan ini, perubahan konten database tidak mengganggu dictionary statis.

## Kolom bilingual yang dipakai

### `profiles`

- `headline` → Indonesia
- `headline_en` → English
- `about` → Indonesia
- `about_en` → English

### `skills`

- `name` → Indonesia/default
- `name_en` → English
- `category` → Indonesia/default
- `category_en` → English

### `experiences`

- `title` → Indonesia/default
- `title_en` → English
- `type` → Indonesia/default
- `type_en` → English
- `description` → Indonesia/default
- `description_en` → English

## Cara update database Supabase yang sudah ada
Buka **Supabase Dashboard → SQL Editor**, lalu jalankan:

```sql
-- Copy isi file ini:
-- supabase/migrations/20260611_database_i18n.sql
```

Setelah SQL dijalankan, buka admin dashboard dan isi field English yang masih kosong.

## Fallback behavior

Frontend memakai helper `getLocalizedText()`.

Jika mode English aktif tapi field `_en` kosong, website otomatis memakai field default Indonesia. Jadi website tidak akan blank.