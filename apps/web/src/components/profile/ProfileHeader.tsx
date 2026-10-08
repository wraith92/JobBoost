import {
  BriefcaseBusiness,
  GraduationCap,
  Layers3,
  Sparkles,
} from 'lucide-react';

import type {
  Profile,
} from './profile.types';

export default function ProfileHeader({
  profile,
}: {
  profile: Profile;
}) {
  const stats = [
    {
      label:
        'Expériences',

      value:
        profile.experiences.length,

      icon:
        BriefcaseBusiness,
    },

    {
      label:
        'Compétences',

      value:
        profile.skills.length,

      icon:
        Sparkles,
    },

    {
      label:
        'Projets',

      value:
        profile.projects.length,

      icon:
        Layers3,
    },

    {
      label:
        'Formations',

      value:
        profile.educations.length,

      icon:
        GraduationCap,
    },
  ];

  return (
    <header>
      <span
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-violet-600

          dark:text-violet-300
        "
      >
        Profil candidat
      </span>

      <h1
        className="
          mt-2
          text-[28px]
          font-semibold
          tracking-[-0.035em]
          text-zinc-950

          dark:text-zinc-50
        "
      >
        Mon profil
      </h1>

      <p
        className="
          mt-2
          text-[11px]
          text-zinc-500

          dark:text-zinc-400
        "
      >
        Source de vérité utilisée par
        JobBoost pour le matching,
        les CV et les candidatures.
      </p>

      <div
        className="
          mt-5
          grid gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {stats.map(
          (
            item,
          ) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.label
                }
                className="profile-stat-card"
              >
                <div
                  className="
                    flex h-8 w-8
                    items-center
                    justify-center
                    rounded-[10px]
                    bg-violet-50
                    text-violet-600

                    dark:bg-violet-500/10
                    dark:text-violet-300
                  "
                >
                  <Icon
                    size={14}
                  />
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      text-zinc-400
                    "
                  >
                    {item.label}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[20px]
                      font-semibold
                      text-zinc-950

                      dark:text-zinc-50
                    "
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            );
          },
        )}
      </div>
    </header>
  );
}