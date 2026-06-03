import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { Experience } from '@/types/portfolio';

function formatDateRange(startDate: string, endDate: string | null) {
  const formatter = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' });
  const start = formatter.format(new Date(startDate));
  const end = endDate ? formatter.format(new Date(endDate)) : 'Sekarang';
  return `${start} - ${end}`;
}

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  return (
    <section id="experience" className="section-padding">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Pengalaman
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Pengalaman kerja, magang, dan project.
          </h2>
        </div>
        <div className="space-y-5">
          {experiences.map((experience) => (
            <Card key={experience.id}>
              <div className="grid gap-5 md:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <Badge>{experience.type}</Badge>
                  <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                    {experience.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {experience.company}
                  </p>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {formatDateRange(experience.start_date, experience.end_date)}
                  </p>
                </div>
                <div>
                  <p className="leading-7 text-slate-700 dark:text-slate-300">
                    {experience.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {experience.tech_stack.map((tech) => (
                      <Badge key={tech}>{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
