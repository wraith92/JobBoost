import {
  Building2,
  CalendarDays,
  MapPin,
  RadioTower,
  Target,
} from 'lucide-react';

import {
  formatDate,
  formatSource,
} from '../applications.utils';

import type {
  ApplicationDetail,
} from './application-detail.types';

export default function ApplicationOverview({
  application,
}: {
  application:
    ApplicationDetail;
}) {
  const score =
    application.job.analysis
      ?.score ??
    null;

  return (
    <section className="application-detail-card">
      <div>
        <h2 className="application-detail-title">
          Informations
        </h2>

        <p className="application-detail-description">
          Informations principales
          associées à cette candidature.
        </p>
      </div>

      <div
        className="
          mt-5
          grid gap-3
          sm:grid-cols-2
        "
      >
        <InfoItem
          icon={
            Building2
          }
          label="Entreprise"
          value={
            application.job
              .company ??
            'Non renseignée'
          }
        />

        <InfoItem
          icon={
            MapPin
          }
          label="Localisation"
          value={
            application.job
              .location ??
            'Non renseignée'
          }
        />

        <InfoItem
          icon={
            RadioTower
          }
          label="Source"
          value={
            formatSource(
              application.job
                .source,
            )
          }
        />

        <InfoItem
          icon={
            Target
          }
          label="Compatibilité"
          value={
            score !== null
              ? `${score}%`
              : 'Non analysée'
          }
        />

        <InfoItem
          icon={
            CalendarDays
          }
          label="Créée le"
          value={
            formatDate(
              application.createdAt,
            )
          }
        />

        <InfoItem
          icon={
            CalendarDays
          }
          label="Envoyée le"
          value={
            application.appliedAt
              ? formatDate(
                  application.appliedAt,
                )
              : 'Pas encore envoyée'
          }
        />
      </div>

      {application.job
        .analysis?.summary && (
        <div
          className="
            mt-5
            rounded-[14px]
            border
            border-violet-100
            bg-violet-50/50
            p-4

            dark:border-violet-400/10
            dark:bg-violet-500/[0.04]
          "
        >
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-violet-600

              dark:text-violet-300
            "
          >
            Synthèse IA
          </p>

          <p
            className="
              mt-2
              text-[11px]
              leading-5
              text-zinc-600

              dark:text-zinc-300
            "
          >
            {
              application.job
                .analysis.summary
            }
          </p>
        </div>
      )}
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Building2;

  label: string;

  value: string;
}) {
  return (
    <div className="application-detail-info-item">
      <div
        className="
          flex h-8 w-8
          shrink-0
          items-center
          justify-center
          rounded-[9px]
          bg-violet-50
          text-violet-500

          dark:bg-violet-500/10
          dark:text-violet-300
        "
      >
        <Icon
          size={14}
        />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[9px]
            uppercase
            tracking-[0.08em]
            text-zinc-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            truncate
            text-[11px]
            font-medium
            text-zinc-700

            dark:text-zinc-300
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}