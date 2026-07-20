'use client';

import { Boxes } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getLocalizedText } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { Skill } from '@/types/portfolio';

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const { language, text } = useLanguage();

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    const category = getLocalizedText(skill, 'category', language);
    groups[category] = groups[category] ?? [];
    groups[category].push(skill);
    return groups;
  }, {});

  return (
    <section id="skills" className="section-padding">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#e9f5d9] [text-shadow:2px_2px_0_#241b15]">
            {text.skills.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white [text-shadow:4px_4px_0_#241b15] md:text-5xl">
            {text.skills.title}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedSkills).map(([category, items]) => (
            <Card key={category}>
              <div className="flex items-center gap-3 border-b-4 border-[#6f4e37] pb-4">
                <span className="border-2 border-[#241b15] bg-[#4f9d3a] p-2 text-white shadow-[3px_3px_0_#241b15]">
                  <Boxes className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-black uppercase tracking-wide text-[#2b211a] dark:text-[#f6edcf]">
                  {category}
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {items.map((skill) => (
                  <div
                    key={skill.id}
                    className="border-2 border-[#241b15] bg-[#ece0bf] px-3 py-3 text-sm font-bold text-[#2b211a] shadow-[3px_3px_0_rgba(36,27,21,0.4)] transition hover:-translate-y-1 dark:bg-[#465247] dark:text-[#f5f1dc]"
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
