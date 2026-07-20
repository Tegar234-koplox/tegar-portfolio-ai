'use client';

import { Bot, Mail } from 'lucide-react';
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
          <Chatbot />
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
