import {
  Code2,
} from 'lucide-react';

import type {
  Resume,
} from './resume.types';

export default function ResumeSkillsSection({
  skills,
}: {
  skills:
    Resume['content']['skills'];
}) {
  if (
    !skills ||
    skills.length === 0
  ) {
    return null;
  }

  const grouped =
    skills.reduce<
      Record<
        string,
        typeof skills
      >
    >(
      (
        groups,
        skill,
      ) => {
        const category =
          skill.category ??
          'Compétences';

        if (
          !groups[
            category
          ]
        ) {
          groups[
            category
          ] = [];
        }

        groups[
          category
        ].push(
          skill,
        );

        return groups;
      },
      {},
    );

  return (
    <section className="resume-section">

      <div
        className="
          flex items-center
          gap-2
        "
      >
        <div
          className="
            flex h-7 w-7
            items-center
            justify-center
            rounded-lg
            bg-violet-50
            text-violet-600

            dark:bg-violet-500/10
            dark:text-violet-300
          "
        >
          <Code2
            size={13}
          />
        </div>

        <h3 className="resume-section-title">
          Compétences
        </h3>
      </div>

      <div
        className="
          mt-4
          space-y-4
        "
      >
        {Object.entries(
          grouped,
        ).map(
          ([
            category,
            categorySkills,
          ]) => (
            <div
              key={
                category
              }
            >
              <p
                className="
                  mb-2
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-zinc-400
                "
              >
                {category}
              </p>

              <div
                className="
                  flex flex-wrap
                  gap-2
                "
              >
                {categorySkills.map(
                  (
                    skill,
                  ) => (
                    <span
                      key={
                        skill.name
                      }
                      className="resume-skill"
                    >
                      {
                        skill.name
                      }

                      {skill.level !==
                        null && (
                        <span
                          className="
                            ml-1.5
                            text-[8px]
                            opacity-50
                          "
                        >
                          {
                            skill.level
                          }
                          /5
                        </span>
                      )}
                    </span>
                  ),
                )}
              </div>
            </div>
          ),
        )}
      </div>

    </section>
  );
}