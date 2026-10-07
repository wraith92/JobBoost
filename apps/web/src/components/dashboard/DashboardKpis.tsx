import {
  BrainCircuit,
  BriefcaseBusiness,
  Clock3,
  Gauge,
  Send,
  Target,
  type LucideIcon,
} from 'lucide-react';

import type {
  DashboardStats,
} from './dashboard.types';

type Props = {
  jobs:
    DashboardStats['jobs'];

  applications:
    DashboardStats['applications'];
};

type Kpi = {
  label: string;

  value:
    | number
    | string;

  description: string;

  icon:
    LucideIcon;

  tone:
    'violet'
    | 'blue'
    | 'amber'
    | 'emerald';
};

const tones = {
  violet:
    'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',

  blue:
    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',

  amber:
    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',

  emerald:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
};

export default function DashboardKpis({
  jobs,
  applications,
}: Props) {
  const items:
    Kpi[] = [
    {
      label:
        'Offres collectées',

      value:
        jobs.total,

      description:
        'disponibles en base',

      icon:
        BriefcaseBusiness,

      tone:
        'violet',
    },

    {
      label:
        'Analyses terminées',

      value:
        jobs.analyzed,

      description:
        'traitées par l’IA',

      icon:
        BrainCircuit,

      tone:
        'blue',
    },

    {
      label:
        'À analyser',

      value:
        jobs.remainingToAnalyze,

      description:
        'en attente de traitement',

      icon:
        Clock3,

      tone:
        'amber',
    },

    {
      label:
        'Bon potentiel',

      value:
        jobs.compatible,

      description:
        'score supérieur à 50',

      icon:
        Target,

      tone:
        'emerald',
    },

    {
      label:
        'Score moyen',

      value:
        `${jobs.averageScore}%`,

      description:
        'sur les offres analysées',

      icon:
        Gauge,

      tone:
        'violet',
    },

    {
      label:
        'Candidatures',

      value:
        applications.total,

      description:
        'préparées avec JobBoost',

      icon:
        Send,

      tone:
        'blue',
    },
  ];

  return (
    <section
      className="
        grid gap-3
        sm:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-6
      "
    >
      {items.map(
        (item) => {
          const Icon =
            item.icon;

          return (
            <article
              key={
                item.label
              }
              className="
                dashboard-card
                group
                relative
                overflow-hidden
                p-5
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div
                  className={`
                    flex h-9 w-9
                    items-center
                    justify-center
                    rounded-[11px]
                    ${tones[
                      item.tone
                    ]}
                  `}
                >
                  <Icon
                    size={17}
                  />
                </div>

                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-zinc-400

                    dark:text-zinc-600
                  "
                >
                  KPI
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-[12px]
                  font-medium
                  text-zinc-500

                  dark:text-zinc-400
                "
              >
                {item.label}
              </p>

              <p
                className="
                  mt-1
                  text-[27px]
                  font-semibold
                  tracking-[-0.035em]
                  text-zinc-950

                  dark:text-zinc-50
                "
              >
                {item.value}
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-zinc-400

                  dark:text-zinc-500
                "
              >
                {item.description}
              </p>
            </article>
          );
        },
      )}
    </section>
  );
}