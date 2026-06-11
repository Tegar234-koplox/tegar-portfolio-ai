'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import type { Experience, Profile, Skill } from '@/types/portfolio';

type AdminStatus = 'checking' | 'ready' | 'error';

type PageView = {
  id: string;
  path: string;
  referrer: string | null;
  created_at: string;
};

type AnalyticsSummary = {
  totalViews: number;
  todayViews: number;
  totalContacts: number;
};

type AdminNotice = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const emptyAnalyticsSummary: AnalyticsSummary = {
  totalViews: 0,
  todayViews: 0,
  totalContacts: 0,
};

export function AdminDashboard() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [status, setStatus] = useState<AdminStatus>('checking');
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [recentViews, setRecentViews] = useState<PageView[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary>(emptyAnalyticsSummary);
  const [isUploading, setIsUploading] = useState(false);
  
  function showSuccess(message = 'Perubahan berhasil disimpan.') {
    setNotice({
      type: 'success',
      message,
    });

    window.setTimeout(() => {
      setNotice(null);
    }, 4000);
  }

  function showError(error: unknown, fallback = 'Gagal menyimpan perubahan.') {
    let errorMessage = `${fallback} Silakan periksa koneksi, hak akses admin, atau input form.`;

    if (error instanceof Error) {
      errorMessage = `${fallback} Silakan periksa: ${error.message}`;
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      errorMessage = `${fallback} Silakan periksa: ${(error as { message: string }).message}`;
    }

    setNotice({
      type: 'error',
      message: errorMessage,
    });
  }

  async function loadData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      profileResult,
      skillsResult,
      experiencesResult,
      viewsCountResult,
      todayViewsCountResult,
      contactsCountResult,
      recentViewsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').limit(1).maybeSingle(),
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
      supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
      supabase.from('page_views').select('id', { count: 'exact', head: true }),
      supabase
        .from('page_views')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase
        .from('page_views')
        .select('id,path,referrer,created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (profileResult.error) {
      setMessage(`Gagal memuat profil: ${profileResult.error.message}`);
      setStatus('error');
      return;
    }

    if (skillsResult.error) {
      setMessage(`Gagal memuat skills: ${skillsResult.error.message}`);
      setStatus('error');
      return;
    }

    if (experiencesResult.error) {
      setMessage(`Gagal memuat pengalaman: ${experiencesResult.error.message}`);
      setStatus('error');
      return;
    }

    setProfile((profileResult.data as Profile | null) ?? null);
    setSkills((skillsResult.data ?? []) as Skill[]);
    setExperiences((experiencesResult.data ?? []) as Experience[]);
    setRecentViews((recentViewsResult.data ?? []) as PageView[]);

    setAnalyticsSummary({
      totalViews: viewsCountResult.count ?? 0,
      todayViews: todayViewsCountResult.count ?? 0,
      totalContacts: contactsCountResult.count ?? 0,
    });

    setMessage(null);
    setStatus('ready');
  }

  useEffect(() => {
  async function checkSession() {
    setStatus('checking');
    setMessage('Memeriksa session admin...');

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setMessage(`Gagal membaca session: ${error.message}`);
      setStatus('error');
      return;
    }

    if (!data.session) {
      setProfile(null);
      setSkills([]);
      setExperiences([]);
      setRecentViews([]);
      setAnalyticsSummary(emptyAnalyticsSummary);

      window.location.replace('/admin/login');
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from('app_admins')
      .select('user_id,email')
      .eq('user_id', data.session.user.id)
      .maybeSingle();

    if (adminError) {
      setMessage(`Session terbaca, tapi gagal cek admin: ${adminError.message}`);
      setStatus('error');
      return;
    }

    if (!adminData) {
      setProfile(null);
      setSkills([]);
      setExperiences([]);
      setRecentViews([]);
      setAnalyticsSummary(emptyAnalyticsSummary);

      window.location.replace('/admin/login');
      return;
    }

    setMessage('Session admin valid. Memuat data dashboard...');
    await loadData();
  }

  checkSession();

  function handlePageShow(event: PageTransitionEvent) {
    if (event.persisted) {
      checkSession();
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      checkSession();
    }
  }

  window.addEventListener('pageshow', handlePageShow);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('pageshow', handlePageShow);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [supabase]);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      showError(new Error('Profil belum tersedia.'), 'Gagal menyimpan perubahan profil.');
      return;
    }

    setNotice(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
       name: String(formData.get('name')).trim(),
       name_en: String(formData.get('name_en') || '').trim() || null,
        category: String(formData.get('category')).trim(),
        category_en: String(formData.get('category_en') || '').trim() || null,
          level: Number(formData.get('level')),
    };

    const { error } = await supabase.from('profiles').update(payload).eq('id', profile.id);

    if (error) {
      showError(error, 'Gagal menyimpan perubahan profil.');
      return;
    }

    showSuccess('Perubahan profil berhasil disimpan.');
    await loadData();
  }

  async function uploadProfilePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !profile) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showError(new Error('Format gambar harus PNG, JPG, atau WEBP.'), 'Gagal mengupload foto.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showError(new Error('Ukuran gambar maksimal 3MB.'), 'Gagal mengupload foto.');
      return;
    }

    setNotice(null);
    setIsUploading(true);

    const extension = file.name.split('.').pop() ?? 'png';
    const filePath = `avatars/${profile.id}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      setIsUploading(false);
      showError(uploadError, 'Gagal mengupload foto.');
      return;
    }

    const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        photo_url: data.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    setIsUploading(false);

    if (updateError) {
      showError(updateError, 'Foto berhasil diupload, tetapi gagal menyimpan URL foto.');
      return;
    }

    showSuccess('Foto profil berhasil diperbarui.');
    await loadData();
  }

  async function addSkill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setNotice(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get('name')).trim(),
      category: String(formData.get('category')).trim(),
      category_en: String(formData.get('category_en') || '').trim() || null,
      level: Number(formData.get('level')),
      sort_order: Number(formData.get('sort_order') || 0),
    };

    const { error } = await supabase.from('skills').insert(payload);

    if (error) {
      showError(error, 'Gagal menambahkan skill.');
      return;
    }

    form.reset();
    showSuccess('Skill berhasil ditambahkan.');
    await loadData();
  }

  async function updateSkill(skill: Skill) {
    setNotice(null);

    const { error } = await supabase
      .from('skills')
      .update({
        name: skill.name,
        category: skill.category,
        category_en: skill.category_en || null,
        level: skill.level,
        sort_order: skill.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', skill.id);

    if (error) {
      showError(error, 'Gagal menyimpan perubahan skill.');
      return;
    }

    showSuccess('Perubahan skill berhasil disimpan.');
    await loadData();
  }

  async function deleteSkill(id: string) {
    const isConfirmed = window.confirm('Yakin ingin menghapus skill ini?');

    if (!isConfirmed) return;

    setNotice(null);

    const { error } = await supabase.from('skills').delete().eq('id', id);

    if (error) {
      showError(error, 'Gagal menghapus skill.');
      return;
    }

    showSuccess('Skill berhasil dihapus.');
    await loadData();
  }

  async function addExperience(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setNotice(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: String(formData.get('title')).trim(),
      title_en: String(formData.get('title_en') || '').trim() || null,
      company: String(formData.get('company')).trim(),
      type: String(formData.get('type')).trim(),
      type_en: String(formData.get('type_en') || '').trim() || null,
      start_date: String(formData.get('start_date')),
      end_date: String(formData.get('end_date') || '') || null,
      description: String(formData.get('description')).trim(),
      description_en: String(formData.get('description_en') || '').trim() || null,
      tech_stack: String(formData.get('tech_stack'))
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      sort_order: Number(formData.get('sort_order') || 0),
    };

    const { error } = await supabase.from('experiences').insert(payload);

    if (error) {
      showError(error, 'Gagal menambahkan pengalaman.');
      return;
    }

    form.reset();
    showSuccess('Pengalaman berhasil ditambahkan.');
    await loadData();
  }

  async function updateExperience(experience: Experience) {
    setNotice(null);

    const { error } = await supabase
      .from('experiences')
      .update({
        title: experience.title,
        title_en: experience.title_en || null,
        company: experience.company,
        type: experience.type,
        type_en: experience.type_en || null,
        start_date: experience.start_date,
        end_date: experience.end_date,
        description: experience.description,
        description_en: experience.description_en || null,
        tech_stack: experience.tech_stack,
        sort_order: experience.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', experience.id);

    if (error) {
      showError(error, 'Gagal menyimpan perubahan pengalaman.');
      return;
    }

    showSuccess('Perubahan pengalaman berhasil disimpan.');
    await loadData();
  }

  async function deleteExperience(id: string) {
    const isConfirmed = window.confirm('Yakin ingin menghapus pengalaman ini?');

    if (!isConfirmed) return;

    setNotice(null);

    const { error } = await supabase.from('experiences').delete().eq('id', id);

    if (error) {
      showError(error, 'Gagal menghapus pengalaman.');
      return;
    }

    showSuccess('Pengalaman berhasil dihapus.');
    await loadData();
  }

  async function handleLogout() {
  setNotice(null);
  setStatus('checking');
  setMessage('Logout dari dashboard admin...');

  const { error } = await supabase.auth.signOut();

  localStorage.removeItem('tegar-portfolio-auth');
  sessionStorage.clear();

  if (error) {
    setStatus('ready');
    showError(error, 'Gagal logout.');
    return;
  }

  window.location.replace('/admin/login');
}

  if (status === 'checking') {
    return (
      <main className="container-page py-10">
        <p>Memeriksa sesi admin...</p>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="container-page py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-bold">Admin check gagal</p>
          <p className="mt-2">{message}</p>
        </div>

        <button
          type="button"
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            window.location.href = '/admin/login';
          }}
        >
          Kembali ke Login
        </button>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kelola profil, foto, skills, pengalaman, pesan masuk, dan analytics sederhana.
          </p>
        </div>

        <Button onClick={handleLogout}>Logout</Button>
      </div>

      {notice ? (
        <div
          className={[
            'mb-6 rounded-2xl border p-4 text-sm font-medium',
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : notice.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-slate-200 bg-slate-50 text-slate-700',
          ].join(' ')}
        >
          {notice.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total visits" value={analyticsSummary.totalViews} />
        <StatCard label="Visits hari ini" value={analyticsSummary.todayViews} />
        <StatCard label="Contact messages" value={analyticsSummary.totalContacts} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-bold">Profil & Foto</h2>

          {profile ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-slate-100">
                  <Image
                    src={profile.photo_url ?? '/avatar.png'}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <Input
                    accept="image/png,image/jpeg,image/webp"
                    type="file"
                    onChange={uploadProfilePhoto}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    PNG/JPG/WEBP, maksimal 3MB. Disimpan di Supabase Storage.
                  </p>
                  {isUploading ? (
                    <p className="mt-2 text-sm text-slate-600">Mengupload foto...</p>
                  ) : null}
                </div>
              </div>

              <form className="mt-5 space-y-3" onSubmit={updateProfile}>
                <Input name="name" defaultValue={profile.name} placeholder="Nama" required />
                <Input
                  name="headline"
                  defaultValue={profile.headline}
                  placeholder="Headline Indonesia"
                  required
                />
                <Input
                  name="headline_en"
                  defaultValue={profile.headline_en ?? ''}
                  placeholder="Headline English"
                />
                <Textarea name="about" defaultValue={profile.about} placeholder="About Indonesia" required />
                <Textarea name="about_en" defaultValue={profile.about_en ?? ''} placeholder="About English" />
                <Input
                  name="cv_url"
                  defaultValue={profile.cv_url ?? ''}
                  placeholder="CV URL opsional"
                />
                <Button type="submit" className="w-full">
                  Update Profil
                </Button>
              </form>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Profil belum tersedia. Jalankan seed di schema Supabase.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Recent Traffic</h2>

          <div className="mt-5 space-y-3">
            {recentViews.length === 0 ? (
              <p className="text-sm text-slate-600">Belum ada traffic tercatat.</p>
            ) : null}

            {recentViews.map((view) => (
              <div
                key={view.id}
                className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm"
              >
                <p className="font-semibold text-slate-900">{view.path}</p>
                <p className="mt-1 text-slate-500">
                  {new Date(view.created_at).toLocaleString('id-ID')}
                </p>
                {view.referrer ? (
                  <p className="mt-1 truncate text-slate-500">Referrer: {view.referrer}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold">Tambah Skill</h2>

          <form className="mt-5 space-y-3" onSubmit={addSkill}>
            <Input name="name" placeholder="Nama skill" required />
            <Input name="category" placeholder="Kategori Indonesia, contoh: Frontend" required />
            <Input name="category_en" placeholder="Kategori English, contoh: Frontend" />
            <Input name="level" type="number" min="1" max="100" placeholder="Level 1-100" required />
            <Input name="sort_order" type="number" placeholder="Urutan" />
            <Button type="submit" className="w-full">
              Tambah Skill
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Tambah Pengalaman</h2>

          <form className="mt-5 space-y-3" onSubmit={addExperience}>
            <Input name="title" placeholder="Judul Indonesia" required />
            <Input name="title_en" placeholder="Title English" />
            <Input name="company" placeholder="Perusahaan / Project" required />
            <Input name="type" placeholder="Type Indonesia, contoh: Work / Project / Internship" required />
            <Input name="type_en" placeholder="Type English, example: Work / Project / Internship" />
            <Input name="start_date" type="date" required />
            <Input name="end_date" type="date" />
            <Textarea name="description" placeholder="Deskripsi Indonesia" required />
            <Textarea name="description_en" placeholder="Description English" />
            <Input
              name="tech_stack"
              placeholder="Tech stack pisahkan koma, contoh: Next.js, Supabase"
            />
            <Input name="sort_order" type="number" placeholder="Urutan" />
            <Button type="submit" className="w-full">
              Tambah Pengalaman
            </Button>
          </form>
        </Card>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold">Daftar Skill</h2>

          <div className="mt-5 space-y-4">
            {skills.map((skill) => (
              <div key={skill.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={skill.name}
                    onChange={(event) =>
                      setSkills((items) =>
                        items.map((item) =>
                          item.id === skill.id ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={skill.category}
                    onChange={(event) =>
                      setSkills((items) =>
                        items.map((item) =>
                          item.id === skill.id ? { ...item, category: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={skill.category_en ?? ''}
                    placeholder="Category English"
                    onChange={(event) =>
                      setSkills((items) =>
                        items.map((item) =>
                          item.id === skill.id
                            ? { ...item, category_en: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={skill.level}
                    onChange={(event) =>
                      setSkills((items) =>
                        items.map((item) =>
                          item.id === skill.id
                            ? { ...item, level: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    value={skill.sort_order}
                    onChange={(event) =>
                      setSkills((items) =>
                        items.map((item) =>
                          item.id === skill.id
                            ? { ...item, sort_order: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <Button type="button" onClick={() => updateSkill(skill)}>
                    Update
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-500"
                    onClick={() => deleteSkill(skill.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Daftar Pengalaman</h2>

          <div className="mt-5 space-y-4">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="rounded-2xl border border-slate-200 bg-white/70 p-4"
              >
                <div className="space-y-3">
                  <Input
                    value={experience.title}
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={experience.title_en ?? ''}
                    placeholder="Title English"
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, title_en: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={experience.company}
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, company: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={experience.type}
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, type: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={experience.type_en ?? ''}
                    placeholder="Type English"
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, type_en: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Textarea
                    value={experience.description}
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Textarea
                    value={experience.description_en ?? ''}
                    placeholder="Description English"
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, description_en: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    value={experience.tech_stack.join(', ')}
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? {
                                ...item,
                                tech_stack: event.target.value
                                  .split(',')
                                  .map((value) => value.trim())
                                  .filter(Boolean),
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    value={experience.sort_order}
                    onChange={(event) =>
                      setExperiences((items) =>
                        items.map((item) =>
                          item.id === experience.id
                            ? { ...item, sort_order: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <Button type="button" onClick={() => updateExperience(experience)}>
                    Update
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-500"
                    onClick={() => deleteExperience(experience.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-slate-950">
        {value.toLocaleString('id-ID')}
      </p>
    </Card>
  );
}