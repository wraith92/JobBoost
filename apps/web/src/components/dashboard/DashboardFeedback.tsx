import {
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';

export function DashboardLoading() {
  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <div
          className="
            dashboard-card
            flex min-h-[260px]
            items-center
            justify-center
          "
        >
          <div className="text-center">
            <LoaderCircle
              size={25}
              className="
                mx-auto
                animate-spin
                text-violet-500
              "
            />

            <p
              className="
                mt-4
                text-sm
                font-medium
                text-zinc-600

                dark:text-zinc-300
              "
            >
              Chargement du tableau
              de bord
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function DashboardError({
  message,
  onRetry,
}: {
  message: string;

  onRetry:
    () => void;
}) {
  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <div
          className="
            dashboard-card
            flex min-h-[260px]
            items-center
            justify-center
          "
        >
          <div className="max-w-md text-center">
            <div
              className="
                mx-auto
                flex h-11 w-11
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600

                dark:bg-red-500/10
                dark:text-red-300
              "
            >
              <TriangleAlert
                size={20}
              />
            </div>

            <h2
              className="
                mt-4
                text-base
                font-semibold
                text-zinc-900

                dark:text-zinc-100
              "
            >
              Impossible de charger
              les données
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-zinc-500

                dark:text-zinc-400
              "
            >
              {message}
            </p>

            <button
              type="button"
              onClick={
                onRetry
              }
              className="
                dashboard-primary-button
                mx-auto mt-5
              "
            >
              <RefreshCw
                size={15}
              />

              Réessayer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}