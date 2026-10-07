import {
  ChartNoAxesCombined,
} from 'lucide-react';

import ActivityChart
  from './ActivityChart';

import type {
  ActivityPoint,
  DashboardPeriod,
} from './dashboard.types';

type Props = {
  data:
    ActivityPoint[];

  period:
    DashboardPeriod;

  loading:
    boolean;

  onPeriodChange:
    (
      period:
        DashboardPeriod,
    ) => void;
};

export default function ActivityCard({
  data,
  period,
  loading,
  onPeriodChange,
}: Props) {
  return (
    <section
      className="
        dashboard-card
        overflow-hidden
      "
    >
      <div
        className="
          flex flex-col
          gap-4
          border-b
          border-zinc-100
          px-6 py-5

          sm:flex-row
          sm:items-center
          sm:justify-between

          dark:border-white/[0.06]
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
              shrink-0
              items-center
              justify-center
              rounded-[11px]
              bg-violet-50
              text-violet-600

              dark:bg-violet-500/10
              dark:text-violet-300
            "
          >
            <ChartNoAxesCombined
              size={17}
            />
          </div>

          <div>
            <h2
              className="
                dashboard-section-title
              "
            >
              Activité récente
            </h2>

            <p
              className="
                dashboard-section-description
              "
            >
              Volumes d&apos;offres,
              d&apos;analyses IA et de
              candidatures préparées.
            </p>
          </div>
        </div>

        <div
          className="
            flex items-center
            gap-3
          "
        >
          {loading && (
            <span
              className="
                hidden
                text-[10px]
                text-zinc-400
                sm:inline
              "
            >
              Actualisation...
            </span>
          )}

          <div
            className="
              inline-flex
              rounded-[11px]
              border
              border-zinc-200
              bg-zinc-50
              p-1

              dark:border-white/[0.07]
              dark:bg-white/[0.025]
            "
          >
            <PeriodButton
              active={
                period === 7
              }
              onClick={() =>
                onPeriodChange(
                  7,
                )
              }
            >
              7 jours
            </PeriodButton>

            <PeriodButton
              active={
                period === 30
              }
              onClick={() =>
                onPeriodChange(
                  30,
                )
              }
            >
              30 jours
            </PeriodButton>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <ActivityChart
          data={
            data
          }
        />
      </div>
    </section>
  );
}

function PeriodButton({
  active,
  children,
  onClick,
}: {
  active: boolean;

  children:
    React.ReactNode;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        rounded-lg
        px-3.5 py-2
        text-[11px]
        font-semibold
        transition-all

        ${
          active
            ? `
              bg-violet-600
              text-white
              shadow-[0_5px_15px_rgba(124,58,237,.20)]

              dark:bg-violet-500
              dark:text-white
            `
            : `
              text-zinc-500

              hover:text-zinc-900

              dark:text-zinc-400
              dark:hover:text-zinc-100
            `
        }
      `}
    >
      {children}
    </button>
  );
}