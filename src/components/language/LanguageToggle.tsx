'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function LanguageToggle() {
  const { language, setLanguage, text } = useLanguage();

  return (
    <div
      aria-label={text.languageToggle.label}
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 text-xs font-bold shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      role="group"
    >
      <Languages className="ml-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
      {(['id', 'en'] as const).map((item) => {
        const isActive = language === item;

        return (
          <button
            key={item}
            type="button"
            className={[
             'rounded-full px-2.5 py-1 transition',
              isActive
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white',
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