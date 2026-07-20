'use client';

import Link from 'next/link';
import { LanguageToggle } from '@/components/language/LanguageToggle';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Navbar() {
  const { text } = useLanguage();

  const navItems = [
    { label: text.navbar.about, href: '#about' },
    { label: text.navbar.skills, href: '#skills' },
    { label: text.navbar.experience, href: '#experience' },
    { label: text.navbar.projects, href: '#projects' },
    { label: text.navbar.chatbot, href: '#chatbot' },
    { label: text.navbar.contact, href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#241b15] bg-[#6f4e37]/95 shadow-[0_5px_0_rgba(36,27,21,0.45)] backdrop-blur-md">
      <nav className="container-page flex min-h-16 items-center justify-between gap-4 py-2">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-[0.16em] text-[#f5e9c8] [text-shadow:2px_2px_0_#241b15]"
        >
          {text.navbar.brand}
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="border-2 border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-[#f5e9c8] transition hover:border-[#241b15] hover:bg-[#4f9d3a]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
