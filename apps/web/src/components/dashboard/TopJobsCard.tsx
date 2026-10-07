import {
  ArrowUpRight,
  Trophy,
} from 'lucide-react';

import Link from 'next/link';

import {
  ScoreBadge,
} from './DashboardBadges';

import type {
  DashboardJob,
} from './dashboard.types';

export default function TopJobsCard({
  jobs,
}: {
  jobs:
    DashboardJob[];
}) {
  return (
    <section
      className="
        dashboard-card
        p-6
        lg:col-span-2
      "
    >
      <div
        className="
          mb-5
          flex items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex items-start
            gap-3
          "
        >
          <div
            className="
              flex h-9 w-9
              items-center
              justify-center
              rounded-[11px]
              bg-violet-50
              text-violet-600

              dark:bg-violet-500/10
              dark:text-violet-300
            "
          >
            <Trophy
              size={17}
            />
          </div>

          <div>
            <h2 className="dashboard-section-title">
              Opportunités prioritaires
            </h2>

            <p className="dashboard-section-description">
              Offres présentant les
              meilleurs scores de
              compatibilité.
            </p>
          </div>
        </div>

        <Link
          href="/jobs"
          className="
            flex shrink-0
            items-center
            gap-1
            text-[10px]
            font-semibold
            text-violet-600

            hover:text-violet-700

            dark:text-violet-300
          "
        >
          Toutes les offres

          <ArrowUpRight
            size={13}
          />
        </Link>
      </div>

      <div className="space-y-2.5">
        {jobs.map(
          (
            job,
            index,
          ) => (
            <article
              key={
                job.id
              }
              className="
                group
                flex items-center
                justify-between
                gap-5
                rounded-[14px]
                border
                border-zinc-100
                px-4 py-3.5
                transition

                hover:border-violet-200
                hover:bg-violet-50/30

                dark:border-white/[0.06]
                dark:hover:border-violet-400/20
                dark:hover:bg-violet-500/[0.04]
              "
            >
              <div
                className="
                  flex min-w-0
                  items-center
                  gap-4
                "
              >
                <span
                  className="
                    flex h-8 w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-[9px]
                    bg-zinc-100
                    text-[10px]
                    font-semibold
                    text-zinc-500

                    dark:bg-white/[0.05]
                    dark:text-zinc-400
                  "
                >
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-[12px]
                      font-semibold
                      text-zinc-900

                      dark:text-zinc-100
                    "
                  >
                    {job.title}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-[10px]
                      text-zinc-400

                      dark:text-zinc-500
                    "
                  >
                    {job.company ??
                      'Entreprise non renseignée'}

                    {job.location
                      ? ` · ${job.location}`
                      : ''}
                  </p>

                  {job.technologies.length >
                    0 && (
                    <div
                      className="
                        mt-2
                        flex flex-wrap
                        gap-1
                      "
                    >
                      {job.technologies
                        .slice(
                          0,
                          3,
                        )
                        .map(
                          (
                            technology,
                          ) => (
                            <span
                              key={
                                technology
                              }
                              className="
                                rounded-md
                                bg-zinc-100
                                px-2 py-1
                                text-[9px]
                                text-zinc-500

                                dark:bg-white/[0.05]
                                dark:text-zinc-400
                              "
                            >
                              {
                                technology
                              }
                            </span>
                          ),
                        )}
                    </div>
                  )}
                </div>
              </div>

              <ScoreBadge
                score={
                  job.score
                }
              />
            </article>
          ),
        )}

        {jobs.length ===
          0 && (
          <p
            className="
              py-10
              text-center
              text-xs
              text-zinc-400
            "
          >
            Aucune offre analysée.
          </p>
        )}
      </div>
    </section>
  );
}