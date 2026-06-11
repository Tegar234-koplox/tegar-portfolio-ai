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
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-sm font-black tracking-tight text-slate-950 dark:text-white">
          {text.navbar.brand}<span className="text-slate-400">.</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:border-white dark:hover:text-white"
          >
            {text.navbar.admin}
          </Link>
        </div>
      </nav>
    </header>
  );
}
