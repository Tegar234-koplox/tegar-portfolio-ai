'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setStatus('Memproses login...');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      setStatus('Email dan password wajib diisi.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus(`Login gagal: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        setStatus('Login gagal: session tidak terbentuk.');
        setIsLoading(false);
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('app_admins')
        .select('user_id,email')
        .eq('user_id', data.session.user.id)
        .maybeSingle();

      if (adminError) {
        setStatus(`Login berhasil, tapi gagal cek admin: ${adminError.message}`);
        setIsLoading(false);
        return;
      }

      if (!adminData) {
        setStatus('Login berhasil, tapi akun ini belum terdaftar sebagai admin.');
        setIsLoading(false);
        return;
      }

      setStatus('Login berhasil. Mengalihkan ke dashboard admin...');

setTimeout(() => {
  window.location.replace('http://localhost:3000/admin');
}, 500);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Login gagal.');
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
        />

        <Input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Memproses...' : 'Masuk'}
        </Button>

        {status ? (
          <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
            {status}
          </p>
        ) : null}
      </form>
    </Card>
  );
}