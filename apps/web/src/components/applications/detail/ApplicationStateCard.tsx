import {
  CalendarCheck2,
  Clock3,
} from 'lucide-react';

import {
  StatusBadge,
} from '../ApplicationBadges';

import {
  formatDate,
} from '../applications.utils';

import type {
  ApplicationDetail,
} from './application-detail.types';

export default function ApplicationStateCard({
  application,
}: {
  application:
    ApplicationDetail;
}) {
  return (
    <section className="application-detail-card">
      <div>
        <h2 className="application-detail-title">
          État du dossier
        </h2>

        <p className="application-detail-description">
          Statut et échéances de
          la candidature.
        </p>
      </div>

      <div className="mt-5">
        <StatusBadge
          status={
            application.status
          }
        />
      </div>

      <div
        className="
          mt-5
          space-y-3
        "
      >
        <TimelineRow
          icon={
            Clock3
          }
          label="Créée"
          value={
            formatDate(
              application.createdAt,
            )
          }
        />

        <TimelineRow
          icon={
            CalendarCheck2
          }
          label="Envoyée"
          value={
            application.appliedAt
              ? formatDate(
                  application.appliedAt,
                )
              : 'En attente'
          }
        />

        <TimelineRow
          icon={
            Clock3
          }
          label="Relance"
          value={
            application.followUpAt
              ? new Intl.DateTimeFormat(
                  'fr-FR',
                  {
                    day:
                      '2-digit',

                    month:
                      '2-digit',

                    year:
                      'numeric',

                    hour:
                      '2-digit',

                    minute:
                      '2-digit',
                  },
                ).format(
                  new Date(
                    application.followUpAt,
                  ),
                )
              : 'Non planifiée'
          }
        />
      </div>
    </section>
  );
}

function TimelineRow({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Clock3;

  label: string;

  value: string;
}) {
  return (
    <div
      className="
        flex items-center
        gap-3
      "
    >
      <div
        className="
          flex h-7 w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-zinc-100
          text-zinc-400

          dark:bg-white/[0.05]
          dark:text-zinc-500
        "
      >
        <Icon
          size={12}
        />
      </div>

      <div>
        <p
          className="
            text-[9px]
            text-zinc-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-[1px]
            text-[10px]
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