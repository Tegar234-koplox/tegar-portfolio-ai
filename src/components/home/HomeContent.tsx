'use client';

import { Bot, ChevronRight, Mail } from 'lucide-react';
import { Chatbot } from '@/components/chatbot/Chatbot';
import { ContactForm } from '@/components/contact/ContactForm';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { AboutSection } from '@/components/sections/AboutSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { FeaturedProjectsSection } from '@/components/sections/FeaturedProjectsSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { PortfolioData } from '@/types/portfolio';
import Link from 'next/link';
export function HomeContent({ data }: { data: PortfolioData }) {
  const { text } = useLanguage();

  return (
    <main>
      <Navbar />
      <HeroSection profile={data.profile} />
      <AboutSection profile={data.profile} />
      <SkillsSection skills={data.skills} />
      <ExperienceSection experiences={data.experiences} />
      <FeaturedProjectsSection />

      <section id="chatbot" className="section-padding">
        <div className="container-page">
          <div className="pixel-border mb-8 max-w-2xl bg-[#8fd3f4] p-6 dark:bg-[#28485f]">
            <Bot className="h-8 w-8 text-[#2f6f28] dark:text-[#9ad483]" />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-[#315f7a] dark:text-[#a9d8ef]">
              {text.chatbotSection.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#17263a] dark:text-[#f6edcf] md:text-5xl">
              {text.chatbotSection.title}
            </h2>
            <p className="mt-4 font-medium leading-7 text-[#20364a] dark:text-[#e8f2f7]">
              {text.chatbotSection.description}
            </p>
          </div>
          <>
            {/* Desktop */}
  <div className="hidden lg:block">
    <Chatbot />
  </div>

  {/* Mobile */}
  <div className="lg:hidden">
    <Link
      href="/ai-chat"
      className="flex w-full items-center justify-between border-4 border-[#241b15] bg-[#6db7df] p-4 text-[#17263a] shadow-[6px_6px_0_#241b15] transition active:translate-x-1 active:translate-y-1 active:shadow-none dark:bg-[#223d52] dark:text-[#f6edcf]"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center border-2 border-[#241b15] bg-[#f5c542] text-[#2b211a] shadow-[3px_3px_0_#241b15]">
          <Bot className="h-6 w-6" />
        </span>

        <div className="text-left">
          <p className="text-base font-black uppercase tracking-wide">
            TRY AI CHATBOT
          </p>

          <p className="mt-1 text-xs font-bold opacity-75">
            Ask about services, projects, and pricing
          </p>
        </div>
      </div>

      <ChevronRight className="h-6 w-6 shrink-0" />
    </Link>
  </div>
</>
        </div>
      </section>

      <section id="contact" className="section-padding">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="pixel-border h-fit bg-[#8fd3f4] p-6 dark:bg-[#28485f]">
            <Mail className="h-8 w-8 text-[#2f6f28] dark:text-[#9ad483]" />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-[#315f7a] dark:text-[#a9d8ef]">
              {text.contactSection.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#17263a] dark:text-[#f6edcf] md:text-5xl">
              {text.contactSection.title}
            </h2>
            <p className="mt-4 font-medium leading-7 text-[#20364a] dark:text-[#e8f2f7]">
              {text.contactSection.description}
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
