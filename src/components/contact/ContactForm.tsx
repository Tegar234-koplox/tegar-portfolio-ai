'use client';

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
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
          if (detailText) {
            errorMessage = `${errorMessage} ${detailText}`;
          }
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
    <Card>
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
          {isLoading ? text.contactForm.loadingButton : text.contactForm.sendButton}{' '}
          <Send className="ml-2 h-4 w-4" />
        </Button>
        {status ? <p className="text-sm text-slate-600 dark:text-slate-300">{status}</p> : null}
      </form>
    </Card>
  );
}
