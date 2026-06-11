'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Footer() {
  const { text } = useLanguage();

  return (
    <footer className="border-t border-slate-200/70 py-8 dark:border-slate-800">
      <div className="container-page flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Tegar Sang Putra. {text.footer.rights}</p>
        <p>{text.footer.builtWith}</p>
      </div>
    </footer>
  );
}
