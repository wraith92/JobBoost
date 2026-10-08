import {
  MapPin,
} from 'lucide-react';

import type {
  Resume,
} from './resume.types';

import {
  formatPeriod,
} from './resume.utils';

export default function ResumeExperienceSection({
  experiences,
}: {
  experiences:
    Resume['content']['experiences'];
}) {
  if (
    experiences.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="resume-section">
      <h3 className="resume-section-title">
        Expériences professionnelles
      </h3>

      <div className="mt-4 space-y-6">
        {experiences.map(
          (
            experience,
          ) => (
            <article
              key={
                experience.id
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
                      text-[12px]
                      font-semibold
                      text-zinc-900

                      dark:text-zinc-100
                    "
                  >
                    {
                      experience.title
                    }
                  </h4>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-medium
                      text-violet-600

                      dark:text-violet-300
                    "
                  >
                    {
                      experience.company
                    }
                  </p>
                </div>

                <div
                  className="
                    shrink-0
                    text-left
                    text-[9px]
                    leading-5
                    text-zinc-400

                    sm:text-right
                  "
                >
                  <p>
                    {formatPeriod(
                      experience.startDate,
                      experience.endDate,
                      experience.current,
                    )}
                  </p>

                  {experience.location && (
                    <p
                      className="
                        inline-flex
                        items-center
                        gap-1
                      "
                    >
                      <MapPin
                        size={9}
                      />

                      {
                        experience.location
                      }
                    </p>
                  )}
                </div>
              </div>

              {experience.description && (
                <p
                  className="
                    mt-3
                    text-[10.5px]
                    leading-5
                    text-zinc-500

                    dark:text-zinc-400
                  "
                >
                  {
                    experience.description
                  }
                </p>
              )}

              {experience.bullets.length >
                0 && (
                <ul className="resume-bullet-list">
                  {experience.bullets.map(
                    (
                      bullet,
                      index,
                    ) => (
                      <li
                        key={
                          `${experience.id}-${index}`
                        }
                      >
                        {bullet}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}