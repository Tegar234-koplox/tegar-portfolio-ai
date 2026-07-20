'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Footer() {
  const { text } = useLanguage();

  return (
    <footer className="border-t-4 border-[#241b15] bg-[#28485f] py-8 text-[#f6edcf] shadow-[0_-5px_0_rgba(36,27,21,0.4)]">
      <div className="container-page flex flex-col gap-2 text-sm font-bold md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Tegar Sang Putra. {text.footer.rights}</p>
        <p className="text-[#b9d9e9]">{text.footer.builtWith}</p>
      </div>
    </footer>
  );
}
