'use client';

import { useEffect, useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function ContactForm() {
  const { text } = useLanguage();
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState<number>(Date.now());

  useEffect(() => {
    setFormStartedAt(Date.now());
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setIsLoading(true);
    setStatus(null);

    const formData = new FormData(form);

    const payload = {
      ...Object.fromEntries(formData.entries()),
      formStartedAt,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const rawText = await response.text();

      let data: {
        message?: string;
        error?: string;
        details?: Record<string, string[]>;
      } = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        let errorMessage = data.error ?? `${text.contactForm.requestFailed} ${response.status}.`;

        if (data.details) {
          const detailText = Object.values(data.details).flat().join(' ');
          if (detailText) errorMessage = `${errorMessage} ${detailText}`;
        }

        setStatus(errorMessage);
        return;
      }

      setStatus(data.message ?? text.contactForm.success);
      form.reset();
      setFormStartedAt(Date.now());
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus(text.contactForm.connectionError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-[#b9e5ff]/95 dark:bg-[#223d52]/95">
      <div className="mb-5 flex items-center gap-3 border-b-4 border-[#315f7a] pb-4 dark:border-[#4d7892]">
        <span className="border-2 border-[#241b15] bg-[#4f9d3a] p-2 text-white shadow-[3px_3px_0_#241b15]">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#315f7a] dark:text-[#a9d8ef]">
            Message terminal
          </p>
          <p className="mt-1 text-sm font-bold text-[#17263a] dark:text-[#f6edcf]">
            Isi semua slot sebelum mengirim pesan.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          aria-hidden="true"
          autoComplete="off"
          className="hidden"
          name="company"
          tabIndex={-1}
          type="text"
        />
        <Input name="name" placeholder={text.contactForm.name} required />
        <Input name="email" type="email" placeholder={text.contactForm.email} required />
        <Input name="subject" placeholder={text.contactForm.subject} required />
        <Textarea name="message" placeholder={text.contactForm.message} required />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? text.contactForm.loadingButton : text.contactForm.sendButton}
          <Send className="ml-2 h-4 w-4" />
        </Button>
        {status ? (
          <p className="border-2 border-[#241b15] bg-[#8fd3f4] p-3 text-sm font-bold text-[#17263a] shadow-[2px_2px_0_rgba(36,27,21,0.35)] dark:bg-[#31546b] dark:text-[#f6edcf]">
            {status}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
