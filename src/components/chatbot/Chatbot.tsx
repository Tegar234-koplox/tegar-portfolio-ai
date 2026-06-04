'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Send, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';

const starterPrompts = [
  'Saya mau bikin company profile dengan admin panel dan contact form. Estimasi berapa?',
  'Saya butuh aplikasi mobile Android untuk inventory resto multi cabang.',
  'Saya mau chatbot AI untuk website bisnis, bisa analisa harga project.',
];

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Jelaskan project yang ingin dibuat: jenis project, fitur utama, deadline, jumlah halaman, login/admin panel, database, payment, atau integrasi AI. Saya akan bantu analisis kompleksitas dan estimasi harga awal.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function submitMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    const nextMessages: Message[] = [
      ...messages,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        /**
         * Kirim history chat, bukan cuma pesan terakhir.
         * Ini penting supaya backend tahu konteks lanjutan,
         * misalnya user sebelumnya membahas tugas mahasiswa.
         */
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      const data = await response.json();
      console.log('RAW AI REPLY:', data.reply);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data.reply ??
            data.error ??
            'Maaf, terjadi kesalahan saat memproses pesan.',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Koneksi gagal. Coba lagi setelah server aktif.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-3">
        <h3 className="text-xl font-bold">Coba prompt cepat</h3>
        <p className="text-sm leading-6 text-slate-600">
          Gunakan prompt ini untuk menguji estimator. Hasilnya berupa estimasi
          awal, bukan invoice final.
        </p>

        <div className="space-y-3">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              className="w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-left text-sm leading-6 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              onClick={() => submitMessage(prompt)}
              type="button"
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
        <div className="mb-4 max-h-[420px] space-y-4 overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className="flex gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
              </div>

              <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                {message.role === 'assistant' ? (
                <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    p: ({ children }) => (
      <p className="mb-3 leading-6 last:mb-0">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-slate-950">{children}</strong>
    ),
    h1: ({ children }) => (
      <h1 className="mb-3 mt-4 text-xl font-bold leading-7 text-slate-950 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-4 text-lg font-bold leading-7 text-slate-950 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-4 text-base font-bold leading-6 text-slate-950 first:mt-0">
        {children}
      </h3>
    ),
    ul: ({ children }) => (
      <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-6">{children}</li>
    ),
    code: ({ children }) => (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-900">
        {children}
      </code>
    ),
  }}
>
  {message.content}
</ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-line">{message.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Contoh: Saya mau bikin web app inventory dengan login admin, database, dashboard, dan laporan..."
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Menganalisis...' : 'Kirim ke AI'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}