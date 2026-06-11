'use client';

import Image from 'next/image';
import { ArrowUpRight, FileText, Github } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { featuredProjects } from '@/lib/data/featured-projects';
import { getLocalizedText } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function FeaturedProjectsSection() {
  const { language, text } = useLanguage();

  return (
    <section id="projects" className="section-padding">
      <div className="container-page">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            {text.projects.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
            {text.projects.title}
          </h2>

          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            {text.projects.description}
          </p>
        </div>

        <div className="space-y-8">
          {featuredProjects.map((project) => {
            const title = getLocalizedText(project, 'title', language);
            const category = getLocalizedText(project, 'category', language);
            const status = getLocalizedText(project, 'status', language);
            const role = getLocalizedText(project, 'role', language);
            const shortDescription = getLocalizedText(project, 'shortDescription', language);
            const problem = getLocalizedText(project, 'problem', language);
            const solution = getLocalizedText(project, 'solution', language);

            return (
              <Card key={project.id} className="overflow-hidden p-0">
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[320px] bg-slate-100 dark:bg-slate-900">
                    <Image
                      src={project.coverImage}
                      alt={title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-contain p-6"
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge>{category}</Badge>
                      <Badge>{project.year}</Badge>
                      <Badge>{status}</Badge>
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                      {title}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {text.projects.role}: {role}
                    </p>

                    <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                      {shortDescription}
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                          {text.projects.problem}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {problem}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                          {text.projects.solution}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {solution}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {text.projects.techStack}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {text.projects.screenshotPreview}
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {project.screenshots.slice(0, 3).map((screenshot) => {
                          const screenshotTitle = getLocalizedText(screenshot, 'title', language);

                          return (
                            <a
                              key={screenshot.imageUrl}
                              href={screenshot.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                <Image
                                  src={screenshot.imageUrl}
                                  alt={screenshotTitle}
                                  fill
                                  sizes="(max-width: 640px) 100vw, 240px"
                                  className="object-contain p-2 transition duration-300 group-hover:scale-105"
                                />
                              </div>
                              <p className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {screenshotTitle}
                              </p>
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                      {project.liveDemoUrl ? (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                        >
                          {text.projects.liveDemo} <ArrowUpRight className="ml-2 h-4 w-4" />
                        </a>
                      ) : null}

                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                        >
                          GitHub <Github className="ml-2 h-4 w-4" />
                        </a>
                      ) : null}

                      {project.pdfUrl ? (
                        <a
                          href={project.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                        >
                          {text.projects.projectOverview} <FileText className="ml-2 h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
