import {
  ArrowUpRight,
} from 'lucide-react';

import type {
  Resume,
} from './resume.types';

import {
  normalizeExternalUrl,
} from './resume.utils';

export default function ResumeProjectsSection({
  projects,
}: {
  projects:
    Resume['content']['projects'];
}) {
  if (
    projects.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="resume-section">
      <h3 className="resume-section-title">
        Projets pertinents
      </h3>

      <div
        className="
          mt-4
          grid gap-3
          sm:grid-cols-2
        "
      >
        {projects.map(
          (
            project,
          ) => (
            <article
              key={
                project.id
              }
              className="resume-project"
            >
              <div
                className="
                  flex items-start
                  justify-between
                  gap-3
                "
              >
                <h4
                  className="
                    text-[11px]
                    font-semibold
                    text-zinc-900

                    dark:text-zinc-100
                  "
                >
                  {project.name}
                </h4>

                {project.url && (
                  <a
                    href={
                      normalizeExternalUrl(
                        project.url,
                      ) ??
                      '#'
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="
                      text-zinc-400
                      hover:text-violet-500
                    "
                  >
                    <ArrowUpRight
                      size={12}
                    />
                  </a>
                )}
              </div>

              {project.description && (
                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-5
                    text-zinc-500

                    dark:text-zinc-400
                  "
                >
                  {
                    project.description
                  }
                </p>
              )}

              {project.technologies.length >
                0 && (
                <div
                  className="
                    mt-3
                    flex flex-wrap
                    gap-1
                  "
                >
                  {project.technologies.map(
                    (
                      technology,
                    ) => (
                      <span
                        key={
                          technology
                        }
                        className="resume-tech"
                      >
                        {
                          technology
                        }
                      </span>
                    ),
                  )}
                </div>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}