import {
  ArrowUpRight,
  FileCheck2,
} from 'lucide-react';

import Link from 'next/link';

import {
  ApplicationStatusBadge,
  ScoreBadge,
} from './DashboardBadges';

import type {
  RecentApplication,
} from './dashboard.types';

import {
  formatSource,
} from './dashboard.utils';

export default function RecentApplications({
  applications,
}: {
  applications:
    RecentApplication[];
}) {
  return (
    <section className="dashboard-card p-6">
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
            <FileCheck2
              size={17}
            />
          </div>

          <div>
            <h2 className="dashboard-section-title">
              Candidatures récentes
            </h2>

            <p className="dashboard-section-description">
              Dernières candidatures
              préparées avec JobBoost.
            </p>
          </div>
        </div>

        <Link
          href="/applications"
          className="
            flex shrink-0
            items-center
            gap-1
            text-[10px]
            font-semibold
            text-violet-600

            dark:text-violet-300
          "
        >
          Toutes les candidatures

          <ArrowUpRight
            size={13}
          />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table
          className="
            w-full
            min-w-[720px]
            text-left
          "
        >
          <thead>
            <tr
              className="
                border-b
                border-zinc-100

                dark:border-white/[0.06]
              "
            >
              <TableHeader>
                Poste
              </TableHeader>

              <TableHeader>
                Source
              </TableHeader>

              <TableHeader>
                Score
              </TableHeader>

              <TableHeader>
                Statut
              </TableHeader>

              <TableHeader>
                Action
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {applications.map(
              (
                application,
              ) => (
                <tr
                  key={
                    application.id
                  }
                  className="
                    border-b
                    border-zinc-50
                    last:border-0

                    dark:border-white/[0.04]
                  "
                >
                  <td className="py-4 pr-5">
                    <p
                      className="
                        max-w-md
                        truncate
                        text-[11px]
                        font-semibold
                        text-zinc-800

                        dark:text-zinc-200
                      "
                    >
                      {
                        application
                          .job.title
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-[9px]
                        text-zinc-400
                      "
                    >
                      {application
                        .job.company ??
                        'Entreprise non renseignée'}
                    </p>
                  </td>

                  <td
                    className="
                      py-4 pr-5
                      text-[10px]
                      text-zinc-500

                      dark:text-zinc-400
                    "
                  >
                    {formatSource(
                      application
                        .job.source,
                    )}
                  </td>

                  <td className="py-4 pr-5">
                    <ScoreBadge
                      score={
                        application
                          .job.score
                      }
                    />
                  </td>

                  <td className="py-4 pr-5">
                    <ApplicationStatusBadge
                      status={
                        application.status
                      }
                    />
                  </td>

                  <td className="py-4">
                    <Link
                      href={`/applications/${application.id}`}
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-[10px]
                        font-semibold
                        text-violet-600

                        hover:text-violet-700

                        dark:text-violet-300
                      "
                    >
                      Ouvrir

                      <ArrowUpRight
                        size={12}
                      />
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        {applications.length ===
          0 && (
          <p
            className="
              py-10
              text-center
              text-xs
              text-zinc-400
            "
          >
            Aucune candidature récente.
          </p>
        )}
      </div>
    </section>
  );
}

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th
      className="
        pb-3
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.1em]
        text-zinc-400
      "
    >
      {children}
    </th>
  );
}