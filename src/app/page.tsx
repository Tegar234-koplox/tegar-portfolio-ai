import { Chatbot } from '@/components/chatbot/Chatbot';
import { ContactForm } from '@/components/contact/ContactForm';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { AboutSection } from '@/components/sections/AboutSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { getPortfolioData } from '@/lib/data/portfolio';

export default async function HomePage() {
  const data = await getPortfolioData();

  return (
    <main>
      <Navbar />
      <HeroSection profile={data.profile} />
      <AboutSection profile={data.profile} />
      <SkillsSection skills={data.skills} />
      <ExperienceSection experiences={data.experiences} />
      <section id="chatbot" className="section-padding">
        <div className="container-page">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">AI Consultant</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Chatbot Estimasi Project</h2>
            <p className="mt-4 text-slate-600">
              Tanyakan kebutuhan website, web app, chatbot AI, atau aplikasi mobile. AI akan menganalisis kompleksitas dan sistem akan menghitung estimasi harga awal dalam Rupiah.
            </p>
          </div>
          <Chatbot />
        </div>
      </section>
      <section id="contact" className="section-padding">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Contact Me</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Diskusikan project secara jelas.</h2>
            <p className="mt-4 text-slate-600">
              Jelaskan tujuan bisnis, fitur utama, deadline, dan referensi desain. Scope yang jelas membuat estimasi biaya lebih akurat.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
