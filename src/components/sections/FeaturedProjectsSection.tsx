'use client';

import Image from 'next/image';
import { ArrowUpRight, FileText, Github, Map } from 'lucide-react';
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
        <div className="pixel-border mb-10 max-w-3xl bg-[#8fd3f4] p-6 dark:bg-[#28485f]">
          <Map className="h-8 w-8 text-[#2f6f28] dark:text-[#9ad483]" />
          <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-[#315f7a] dark:text-[#a9d8ef]">
            {text.projects.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#17263a] dark:text-[#f6edcf] md:text-5xl">
            {text.projects.title}
          </h2>
          <p className="mt-4 font-medium leading-7 text-[#20364a] dark:text-[#e8f2f7]">{text.projects.description}</p>
        </div>

        <div className="space-y-8">
          {featuredProjects.map((project, projectIndex) => {
            const title = getLocalizedText(project, 'title', language);
            const category = getLocalizedText(project, 'category', language);
            const status = getLocalizedText(project, 'status', language);
            const role = getLocalizedText(project, 'role', language);
            const shortDescription = getLocalizedText(project, 'shortDescription', language);
            const problem = getLocalizedText(project, 'problem', language);
            const solution = getLocalizedText(project, 'solution', language);

            return (
              <Card key={project.id} className="overflow-hidden bg-[#b9e5ff]/95 p-0 dark:bg-[#223d52]/95">
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[320px] border-b-4 border-[#241b15] bg-[#87ceeb] lg:border-b-0 lg:border-r-4 dark:bg-[#1a3345]">
                    <div className="absolute left-4 top-4 z-10 border-2 border-[#241b15] bg-[#f5c542] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#2b211a] shadow-[3px_3px_0_#241b15]">
                      Build {String(projectIndex + 1).padStart(2, '0')}
                    </div>
                    <Image
                      src={project.coverImage}
                      alt={title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-contain p-6 pt-16"
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge>{category}</Badge>
                      <Badge>{project.year}</Badge>
                      <Badge>{status}</Badge>
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-[#17263a] dark:text-[#f6edcf]">{title}</h3>
                    <p className="mt-2 text-sm font-black text-[#315f7a] dark:text-[#b9d9e9]">
                      {text.projects.role}: {role}
                    </p>
                    <p className="mt-4 font-medium leading-7 text-[#20364a] dark:text-[#e8f2f7]">{shortDescription}</p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="border-2 border-[#241b15] bg-[#8fd3f4] p-4 shadow-[3px_3px_0_rgba(36,27,21,0.35)] dark:bg-[#31546b]">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#244f69] dark:text-[#a9d8ef]">
                          {text.projects.problem}
                        </p>
                        <p className="mt-2 text-sm font-medium leading-6 text-[#17263a] dark:text-[#f0f6f8]">{problem}</p>
                      </div>

                      <div className="border-2 border-[#241b15] bg-[#8fd3f4] p-4 shadow-[3px_3px_0_rgba(36,27,21,0.35)] dark:bg-[#31546b]">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#244f69] dark:text-[#a9d8ef]">
                          {text.projects.solution}
                        </p>
                        <p className="mt-2 text-sm font-medium leading-6 text-[#17263a] dark:text-[#f0f6f8]">{solution}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#315f7a] dark:text-[#a9d8ef]">
                        {text.projects.techStack}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#315f7a] dark:text-[#a9d8ef]">
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
                              className="group overflow-hidden border-2 border-[#241b15] bg-[#8fd3f4] shadow-[3px_3px_0_rgba(36,27,21,0.35)] transition hover:-translate-y-1 dark:bg-[#31546b]"
                            >
                              <div className="relative aspect-video w-full overflow-hidden border-b-2 border-[#241b15] bg-[#72bee7] dark:bg-[#1c3749]">
                                <Image
                                  src={screenshot.imageUrl}
                                  alt={screenshotTitle}
                                  fill
                                  sizes="(max-width: 640px) 100vw, 240px"
                                  className="object-contain p-2 transition duration-300 group-hover:scale-105"
                                />
                              </div>
                              <p className="p-2 text-xs font-bold text-[#17263a] dark:text-[#f6edcf]">{screenshotTitle}</p>
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
                          className="pixel-border inline-flex items-center bg-[#4f9d3a] px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-1 hover:bg-[#62b948]"
                        >
                          {text.projects.liveDemo} <ArrowUpRight className="ml-2 h-4 w-4" />
                        </a>
                      ) : null}

                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="pixel-border inline-flex items-center bg-[#737373] px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-1 hover:bg-[#898989]"
                        >
                          GitHub <Github className="ml-2 h-4 w-4" />
                        </a>
                      ) : null}

                      {project.pdfUrl ? (
                        <a
                          href={project.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="pixel-border inline-flex items-center bg-[#315f7a] px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-1 hover:bg-[#427d9d]"
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
