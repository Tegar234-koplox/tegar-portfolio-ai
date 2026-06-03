import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Profile } from '@/types/portfolio';

export function HeroSection({ profile }: { profile: Profile }) {
  return (
    <section className="section-padding overflow-hidden pt-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            <Sparkles className="h-4 w-4" />
            Available for web, UI/UX, and Mobile App
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl">
            Where design meets function.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {profile.headline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contact">
              <Button>
                Contact Me <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a
              href="#chatbot"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-950 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-white"
            >
              Ask AI Estimator
            </a>
          </div>
        </div>

        <Card className="relative mx-auto w-full max-w-md p-4">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-slate-950/10 blur-3xl dark:bg-white/10" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-100 dark:bg-slate-800">
            <Image
              src={profile.photo_url ?? '/avatar.png'}
              alt={profile.name}
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{profile.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {profile.about.slice(0, 130)}...
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
