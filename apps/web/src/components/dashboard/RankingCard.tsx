import {
  AlertTriangle,
  Layers3,
} from 'lucide-react';

import type {
  DashboardRankingItem,
} from './dashboard.types';

type Props = {
  title: string;
  description: string;

  items:
    DashboardRankingItem[];

  variant:
    | 'technology'
    | 'missing';
};

export default function RankingCard({
  title,
  description,
  items,
  variant,
}: Props) {
  const Icon =
    variant ===
      'technology'
      ? Layers3
      : AlertTriangle;

  const max =
    items.length >
    0
      ? Math.max(
          ...items.map(
            (
              item,
            ) =>
              item.count,
          ),
        )
      : 0;

  return (
    <section className="dashboard-card p-6">
      <div
        className="
          flex items-start
          gap-3
        "
      >
        <div
          className={`
            flex h-9 w-9
            items-center
            justify-center
            rounded-[11px]

            ${
              variant ===
              'technology'
                ? `
                  bg-violet-50
                  text-violet-600

                  dark:bg-violet-500/10
                  dark:text-violet-300
                `
                : `
                  bg-amber-50
                  text-amber-600

                  dark:bg-amber-500/10
                  dark:text-amber-300
                `
            }
          `}
        >
          <Icon
            size={17}
          />
        </div>

        <div>
          <h2 className="dashboard-section-title">
            {title}
          </h2>

          <p className="dashboard-section-description">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map(
          (
            item,
            index,
          ) => {
            const percentage =
              max >
              0
                ? Math.round(
                    (
                      item.count /
                      max
                    ) *
                      100,
                  )
                : 0;

            return (
              <div
                key={
                  item.name
                }
              >
                <div
                  className="
                    mb-1.5
                    flex items-center
                    justify-between
                    gap-3
                  "
                >
                  <div
                    className="
                      flex min-w-0
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className="
                        w-5 shrink-0
                        text-[9px]
                        font-semibold
                        text-zinc-400
                      "
                    >
                      {String(
                        index +
                          1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <span
                      className="
                        truncate
                        text-[11px]
                        font-medium
                        text-zinc-700

                        dark:text-zinc-300
                      "
                    >
                      {item.name}
                    </span>
                  </div>

                  <span
                    className="
                      shrink-0
                      text-[10px]
                      font-medium
                      text-zinc-400
                    "
                  >
                    {item.count}
                  </span>
                </div>

                <div
                  className="
                    ml-8
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-zinc-100

                    dark:bg-white/[0.06]
                  "
                >
                  <div
                    className={`
                      h-full
                      rounded-full

                      ${
                        variant ===
                        'technology'
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500'
                      }
                    `}
                    style={{
                      width:
                        `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          },
        )}

        {items.length ===
          0 && (
          <p
            className="
              py-8
              text-center
              text-xs
              text-zinc-400
            "
          >
            Pas encore assez de
            données.
          </p>
        )}
      </div>
    </section>
  );
}