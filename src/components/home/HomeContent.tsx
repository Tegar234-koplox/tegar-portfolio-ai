'use client';

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
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              {text.chatbotSection.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
              {text.chatbotSection.title}
            </h2>
           <p className="mt-4 text-slate-600 dark:text-slate-300">
              {text.chatbotSection.description}
            </p>
          </div>
          <Chatbot />
        </div>
      </section>

      <section id="contact" className="section-padding">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              {text.contactSection.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
              {text.contactSection.title}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
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