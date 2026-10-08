'use client';

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Play,
} from 'lucide-react';

import type {
  AutomationSourceConfig,
} from './automation.types';

export default function AutomationSourceCard({
  source,

  running,

  onRun,
}: {
  source:
    AutomationSourceConfig;

  running:
    boolean;

  onRun:
    () => void;
}) {
  const isFranceTravail =
    source.id ===
    'FRANCE_TRAVAIL';

  return (
    <article
      className={`
        automation-source-card

        ${
          source.ready
            ? ''
            : 'automation-source-card-disabled'
        }
      `}
    >
      <div
        className="
          flex items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex items-center
              gap-2
            "
          >
            <div
              className="
                automation-source-icon
              "
            >
              {source.ready ? (
                <CheckCircle2
                  size={14}
                />
              ) : (
                <Clock3
                  size={14}
                />
              )}
            </div>

            <h3
              className="
                text-[11px]
                font-semibold
                text-zinc-900

                dark:text-zinc-100
              "
            >
              {source.label}
            </h3>
          </div>

          <p
            className="
              mt-2
              max-w-[310px]
              text-[9.5px]
              leading-4
              text-zinc-400
            "
          >
            {source.description}
          </p>
        </div>

        <span
          className={`
            automation-source-status

            ${
              source.ready
                ? 'automation-source-status-ready'
                : ''
            }
          `}
        >
          {source.ready
            ? 'Prêt'
            : 'Bientôt'}
        </span>
      </div>

      <div
        className="
          mt-4
          flex items-center
          justify-between
          gap-3
        "
      >
        <div
          className="
            inline-flex
            items-center
            gap-1.5

            text-[9px]
            font-medium
            text-zinc-400
          "
        >
          <CalendarClock
            size={11}
          />

          {source.daily
            ? '1 fois par jour'
            : 'Non configuré'}
        </div>

        {isFranceTravail ? (
          <button
            type="button"
            disabled={
              running
            }
            onClick={
              onRun
            }
            className="automation-run-button"
          >
            {running ? (
              <>
                <span className="automation-button-spinner" />

                Collecte...
              </>
            ) : (
              <>
                <Play
                  size={11}
                />

                Lancer
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="automation-disabled-button"
          >
            À connecter
          </button>
        )}
      </div>
    </article>
  );
}