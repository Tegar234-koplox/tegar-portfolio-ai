'use client';

import { useState } from 'react';
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
    if (!message.trim()) return;

    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.reply ?? data.error ?? 'Maaf, terjadi kesalahan saat memproses pesan.',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'Koneksi gagal. Coba lagi setelah server aktif.' },
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
          Gunakan prompt ini untuk menguji estimator. Hasilnya berupa estimasi awal, bukan invoice final.
        </p>
        <div className="space-y-3">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              className="w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-left text-sm leading-6 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              onClick={() => submitMessage(prompt)}
              type="button"
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
                {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
              </div>
              <div className="whitespace-pre-line rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                {message.content}
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
            {isLoading ? 'Menganalisis...' : 'Kirim ke AI'} <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
