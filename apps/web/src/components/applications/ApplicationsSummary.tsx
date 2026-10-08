import {
  CheckCircle2,
  Clock3,
  MessagesSquare,
  Send,
} from 'lucide-react';

import type {
  Application,
} from './applications.types';

export default function ApplicationsSummary({
  applications,
}: {
  applications:
    Application[];
}) {
  const ready =
    applications.filter(
      (
        item,
      ) =>
        item.status ===
        'READY_TO_VALIDATE',
    ).length;

  const sent =
    applications.filter(
      (
        item,
      ) =>
        [
          'SENT',
          'RESPONSE_RECEIVED',
          'INTERVIEW',
          'REJECTED',
          'FOLLOW_UP',
        ].includes(
          item.status,
        ),
    ).length;

  const responses =
    applications.filter(
      (
        item,
      ) =>
        [
          'RESPONSE_RECEIVED',
          'INTERVIEW',
          'REJECTED',
        ].includes(
          item.status,
        ),
    ).length;

  const interviews =
    applications.filter(
      (
        item,
      ) =>
        item.status ===
        'INTERVIEW',
    ).length;

  const items = [
    {
      label:
        'À valider',

      value:
        ready,

      icon:
        Clock3,

      className:
        'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    },

    {
      label:
        'Envoyées',

      value:
        sent,

      icon:
        Send,

      className:
        'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    },

    {
      label:
        'Réponses',

      value:
        responses,

      icon:
        MessagesSquare,

      className:
        'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    },

    {
      label:
        'Entretiens',

      value:
        interviews,

      icon:
        CheckCircle2,

      className:
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
  ];

  return (
    <section
      className="
        grid gap-3
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {items.map(
        (
          item,
        ) => {
          const Icon =
            item.icon;

          return (
            <article
              key={
                item.label
              }
              className="
                applications-summary-card
              "
            >
              <div
                className={`
                  flex h-8 w-8
                  items-center
                  justify-center
                  rounded-[10px]
                  ${item.className}
                `}
              >
                <Icon
                  size={15}
                />
              </div>

              <div>
                <p
                  className="
                    text-[10px]
                    text-zinc-400
                  "
                >
                  {item.label}
                </p>

                <p
                  className="
                    mt-0.5
                    text-[21px]
                    font-semibold
                    tracking-[-0.03em]
                    text-zinc-950

                    dark:text-zinc-50
                  "
                >
                  {item.value}
                </p>
              </div>
            </article>
          );
        },
      )}
    </section>
  );
}