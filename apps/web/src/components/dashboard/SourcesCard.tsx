import {
  Database,
} from 'lucide-react';

import {
  formatSource,
} from './dashboard.utils';

type Props = {
  totalJobs:
    number;

  sources: {
    source:
      string;

    count:
      number;
  }[];
};

export default function SourcesCard({
  totalJobs,
  sources,
}: Props) {
  return (
    <section className="dashboard-card p-6">
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
            bg-blue-50
            text-blue-600

            dark:bg-blue-500/10
            dark:text-blue-300
          "
        >
          <Database
            size={17}
          />
        </div>

        <div>
          <h2 className="dashboard-section-title">
            Sources d&apos;acquisition
          </h2>

          <p className="dashboard-section-description">
            Répartition des offres
            collectées par plateforme.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {sources.map(
          (item) => {
            const percentage =
              totalJobs >
              0
                ? Math.round(
                    (
                      item.count /
                      totalJobs
                    ) *
                      100,
                  )
                : 0;

            return (
              <div
                key={
                  item.source
                }
              >
                <div
                  className="
                    mb-2
                    flex items-center
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[11px]
                        font-medium
                        text-zinc-700

                        dark:text-zinc-300
                      "
                    >
                      {formatSource(
                        item.source,
                      )}
                    </p>

                    <p
                      className="
                        mt-[2px]
                        text-[9px]
                        text-zinc-400
                      "
                    >
                      {percentage}%
                      du volume
                    </p>
                  </div>

                  <span
                    className="
                      text-[11px]
                      font-semibold
                      text-zinc-600

                      dark:text-zinc-300
                    "
                  >
                    {item.count}
                  </span>
                </div>

                <div
                  className="
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-zinc-100

                    dark:bg-white/[0.06]
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-violet-500
                      to-fuchsia-500
                    "
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
      </div>
    </section>
  );
}