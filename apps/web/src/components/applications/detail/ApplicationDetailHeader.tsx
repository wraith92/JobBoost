import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
} from 'lucide-react';

import Link from 'next/link';

import {
  ScoreBadge,
  StatusBadge,
} from '../ApplicationBadges';

import type {
  ApplicationDetail,
} from './application-detail.types';

export default function ApplicationDetailHeader({
  application,
}: {
  application:
    ApplicationDetail;
}) {
  const score =
    application.job.analysis
      ?.score ??
    null;

  const offerUrl =
    application.job
      .applicationUrl ??
    application.job.url ??
    null;

  return (
    <header>
      <Link
        href="/applications"
        className="
          application-detail-back
        "
      >
        <ArrowLeft
          size={13}
        />

        Mes candidatures
      </Link>

      <div
        className="
          mt-5
          flex flex-col
          gap-5

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div className="min-w-0">
          <div
            className="
              mb-3
              flex flex-wrap
              items-center
              gap-2
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-violet-600

                dark:text-violet-300
              "
            >
              <BriefcaseBusiness
                size={12}
              />

              Dossier de candidature
            </span>

            <StatusBadge
              status={
                application.status
              }
            />

            <ScoreBadge
              score={
                score
              }
            />
          </div>

          <h1
            className="
              max-w-4xl
              text-[26px]
              font-semibold
              leading-tight
              tracking-[-0.035em]
              text-zinc-950

              dark:text-zinc-50
            "
          >
            {
              application.job
                .title
            }
          </h1>

          <p
            className="
              mt-2
              text-[11px]
              text-zinc-500

              dark:text-zinc-400
            "
          >
            {application.job
              .company ??
              'Entreprise non renseignée'}

            {application.job
              .location
              ? ` · ${application.job.location}`
              : ''}
          </p>
        </div>

        {offerUrl && (
          <a
            href={
              offerUrl
            }
            target="_blank"
            rel="noreferrer"
            className="
              application-detail-primary-button
            "
          >
            Voir l&apos;offre

            <ArrowUpRight
              size={14}
            />
          </a>
        )}
      </div>
    </header>
  );
}