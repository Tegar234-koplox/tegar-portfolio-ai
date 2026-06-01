import { Card } from '@/components/ui/Card';
import type { Skill } from '@/types/portfolio';

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const groupedSkills = skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    groups[skill.category] = groups[skill.category] ?? [];
    groups[skill.category].push(skill);
    return groups;
  }, {});

  return (
    <section id="skills" className="section-padding">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Skills</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Skill teknis yang relevan untuk delivery project.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedSkills).map(([category, items]) => (
            <Card key={category}>
              <h3 className="text-lg font-bold">{category}</h3>
              <div className="mt-5 space-y-5">
                {items.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800">{skill.name}</span>
                      <span className="text-slate-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-slate-950" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
