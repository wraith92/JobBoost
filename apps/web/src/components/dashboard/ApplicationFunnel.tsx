import {
  CalendarCheck2,
  CheckCircle2,
  MessageSquareText,
  Send,
} from 'lucide-react';

import type {
  DashboardStats,
} from './dashboard.types';

type Props = {
  applications:
    DashboardStats['applications'];
};

export default function ApplicationFunnel({
  applications,
}: Props) {
  const steps = [
    {
      label:
        'À valider',

      description:
        'documents préparés',

      value:
        applications.ready,

      icon:
        CheckCircle2,

      className:
        'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300',
    },

    {
      label:
        'Envoyées',

      description:
        'candidatures transmises',

      value:
        applications.sent,

      icon:
        Send,

      className:
        'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300',
    },

    {
      label:
        'Réponses',

      description:
        'retours recruteurs',

      value:
        applications.responses,

      icon:
        MessageSquareText,

      className:
        'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300',
    },

    {
      label:
        'Entretiens',

      description:
        'processus avancés',

      value:
        applications.interviews,

      icon:
        CalendarCheck2,

      className:
        'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
  ];

  return (
    <section className="dashboard-card p-6">
      <div
        className="
          flex flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h2 className="dashboard-section-title">
            Pipeline de candidature
          </h2>

          <p className="dashboard-section-description">
            Progression des candidatures,
            de la préparation à
            l&apos;entretien.
          </p>
        </div>

        <div className="flex gap-6">
          <Rate
            label="Taux de réponse"
            value={
              applications.responseRate
            }
          />

          <Rate
            label="Taux d'entretien"
            value={
              applications.interviewRate
            }
          />
        </div>
      </div>

      <div
        className="
          mt-6
          grid gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {steps.map(
          (step) => {
            const Icon =
              step.icon;

            return (
              <div
                key={
                  step.label
                }
                className="
                  rounded-[15px]
                  border
                  border-zinc-100
                  bg-zinc-50/70
                  p-4

                  dark:border-white/[0.06]
                  dark:bg-white/[0.025]
                "
              >
                <div
                  className={`
                    flex h-8 w-8
                    items-center
                    justify-center
                    rounded-[9px]
                    ${step.className}
                  `}
                >
                  <Icon
                    size={15}
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-[11px]
                    font-medium
                    text-zinc-500

                    dark:text-zinc-400
                  "
                >
                  {step.label}
                </p>

                <p
                  className="
                    mt-1
                    text-[23px]
                    font-semibold
                    tracking-[-0.03em]
                    text-zinc-950

                    dark:text-zinc-50
                  "
                >
                  {step.value}
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    text-zinc-400

                    dark:text-zinc-500
                  "
                >
                  {
                    step.description
                  }
                </p>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}

function Rate({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="text-right">
      <p
        className="
          text-[9px]
          font-medium
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
          text-[17px]
          font-semibold
          text-zinc-900

          dark:text-zinc-100
        "
      >
        {value}%
      </p>
    </div>
  );
}