'use client';

import { ArrowRight, Bot, Boxes, Code2, Pickaxe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getLocalizedText } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { Profile } from '@/types/portfolio';

export function HeroSection({ profile }: { profile: Profile }) {
  const { language, text } = useLanguage();
  const headline = getLocalizedText(profile, 'headline', language);

  return (
    <section className="section-padding overflow-hidden pt-16">
      <div className="container-page">
        <div className="grid items-stretch gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="relative overflow-hidden bg-[#d7c49b]/95 p-7 md:p-10 dark:bg-[#263329]/95">
            <div className="absolute right-5 top-5 grid grid-cols-3 gap-1 opacity-25">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index} className="h-6 w-6 border-2 border-[#241b15] bg-[#4f9d3a]" />
              ))}
            </div>

            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 border-2 border-[#241b15] bg-[#f5c542] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#2b211a] shadow-[3px_3px_0_#241b15]">
                <Pickaxe className="h-4 w-4" />
                {text.hero.availability}
              </div>

              <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-[#4f6b31] dark:text-[#9bcf78]">
                Player profile · Full-stack developer
              </p>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-[#2b211a] [text-shadow:4px_4px_0_rgba(255,255,255,0.35)] dark:text-[#f6edcf] dark:[text-shadow:4px_4px_0_rgba(0,0,0,0.45)] md:text-7xl">
                {text.hero.title}
              </h1>

              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#4a3a2d] dark:text-[#d5dccf]">
                {headline}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#contact">
                  <Button>
                    {text.hero.contactButton} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="#chatbot"
                  className="pixel-border inline-flex items-center justify-center rounded-none bg-[#737373] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-1 hover:bg-[#8a8a8a]"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  {text.hero.aiButton}
                </a>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            <Card className="bg-[#557a3a]/95 text-white dark:bg-[#36522e]/95">
              <Boxes className="h-8 w-8" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[#d9efc6]">Build mode</p>
              <h2 className="mt-2 text-2xl font-black">Web · Mobile · AI</h2>
              <p className="mt-3 leading-7 text-[#ecf6e5]">
                Merancang produk dari interface, API, database, hingga deployment.
              </p>
            </Card>

            <Card className="bg-[#59636d]/95 text-white dark:bg-[#28313a]/95">
              <Code2 className="h-8 w-8" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[#dce5ec]">Current quest</p>
              <h2 className="mt-2 text-2xl font-black">{profile.name}</h2>
              <p className="mt-3 leading-7 text-[#edf2f6]">
                Building practical software with clear systems, secure workflows, and production discipline.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
