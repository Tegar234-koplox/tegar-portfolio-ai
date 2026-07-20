'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function LanguageToggle() {
  const { language, setLanguage, text } = useLanguage();

  return (
    <div
      aria-label={text.languageToggle.label}
      className="pixel-border inline-flex items-center gap-1 bg-[#8fd3f4] p-1 text-xs font-black text-[#17263a] dark:bg-[#28485f] dark:text-[#f6edcf]"
      role="group"
    >
      <Languages className="ml-1 h-4 w-4" />
      {(['id', 'en'] as const).map((item) => {
        const isActive = language === item;

        return (
          <button
            key={item}
            type="button"
            className={[
              'border-2 border-[#241b15] px-2.5 py-1 uppercase tracking-wide transition',
              isActive
                ? 'bg-[#4f9d3a] text-white shadow-[2px_2px_0_#241b15]'
                : 'bg-[#c7ebff] text-[#17263a] hover:bg-[#a8ddf7] dark:bg-[#36596f] dark:text-[#f6edcf] dark:hover:bg-[#44708b]',
            ].join(' ')}
            onClick={() => setLanguage(item)}
          >
            {text.languageToggle[item]}
          </button>
        );
      })}
    </div>
  );
}
