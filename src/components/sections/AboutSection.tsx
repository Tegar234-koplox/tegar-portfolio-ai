'use client';

import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getLocalizedText } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { Profile } from '@/types/portfolio';

export function AboutSection({ profile }: { profile: Profile }) {
  const { language, text } = useLanguage();
  const about = getLocalizedText(profile, 'about', language);

  return (
    <section id="about" className="section-padding">
      <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="pixel-border h-fit bg-[#8fd3f4] p-6 dark:bg-[#28485f]">
          <BookOpen className="h-8 w-8 text-[#2f6f28] dark:text-[#9ad483]" />
          <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-[#315f7a] dark:text-[#a9d8ef]">
            {text.about.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#17263a] dark:text-[#f6edcf] md:text-5xl">
            {text.about.title}
          </h2>
        </div>
        <Card className="bg-[#b9e5ff]/95 dark:bg-[#223d52]/95">
          <p className="text-lg font-medium leading-8 text-[#20364a] dark:text-[#e8f2f7]">{about}</p>
        </Card>
      </div>
    </section>
  );
}
