'use client';

import Link from 'next/link';
import { ArrowLeft, Bot } from 'lucide-react';
import { Chatbot } from '@/components/chatbot/Chatbot';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function AiChatPage() {
  const { text } = useLanguage();

  return (
    <main className="min-h-dvh overflow-hidden bg-[#6db7df] dark:bg-[#172c3b]">
      <header className="flex h-[72px] items-center gap-3 border-b-4 border-[#241b15] bg-[#79583f] px-3 shadow-[0_4px_0_rgba(36,27,21,0.45)]">
        <Link
          href="/#chatbot"
          aria-label="Back to portfolio"
          className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[#241b15] bg-[#8fd3f4] text-[#17263a] shadow-[3px_3px_0_#241b15] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[#241b15] bg-[#f5c542] text-[#2b211a] shadow-[3px_3px_0_#241b15]">
            <Bot className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-black uppercase tracking-[0.12em] text-[#fff4d6]">
              AI Consultant
            </h1>

            <p className="truncate text-xs font-bold text-[#d9effb]">
              Online · Ready for a new quest
            </p>
          </div>
        </div>
      </header>

      <Chatbot mode="standalone" />
    </main>
  );
}