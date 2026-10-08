import type {
  Resume,
} from './resume.types';

import {
  formatPeriod,
} from './resume.utils';

export default function ResumeEducationSection({
  educations,
}: {
  educations:
    Resume['content']['educations'];
}) {
  if (
    educations.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="resume-section">
      <h3 className="resume-section-title">
        Formation
      </h3>

      <div className="mt-4 space-y-4">
        {educations.map(
          (
            education,
          ) => (
            <article
              key={
                education.id
              }
              className="resume-entry"
            >
              <div
                className="
                  flex flex-col
                  gap-2
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >
                <div>
                  <h4
                    className="
                      text-[11px]
                      font-semibold
                      text-zinc-900

                      dark:text-zinc-100
                    "
                  >
                    {
                      education.degree
                    }
                  </h4>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-zinc-500

                      dark:text-zinc-400
                    "
                  >
                    {
                      education.school
                    }

                    {education.field
                      ? ` · ${education.field}`
                      : ''}
                  </p>
                </div>

                <span
                  className="
                    shrink-0
                    text-[9px]
                    text-zinc-400
                  "
                >
                  {formatPeriod(
                    education.startDate,
                    education.endDate,
                  )}
                </span>
              </div>

              {education.description && (
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
                    education.description
                  }
                </p>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}