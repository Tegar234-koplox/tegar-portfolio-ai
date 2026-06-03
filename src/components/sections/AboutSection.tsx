import { Card } from '@/components/ui/Card';
import type { Profile } from '@/types/portfolio';

export function AboutSection({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="section-padding">
      <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            About Me
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Developer dengan sudut pandang operasional bisnis.
          </h2>
        </div>
        <Card>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">{profile.about}</p>
        </Card>
      </div>
    </section>
  );
}
