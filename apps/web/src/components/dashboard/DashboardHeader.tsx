import {
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import Link from 'next/link';

type Props = {
  loading: boolean;

  onRefresh:
    () => void;
};

export default function DashboardHeader({
  loading,
  onRefresh,
}: Props) {
  return (
    <header
      className="
        flex flex-col
        gap-5
        lg:flex-row
        lg:items-end
        lg:justify-between
      "
    >
      <div>
        <div
          className="
            mb-2
            flex items-center
            gap-2
          "
        >
          <span
            className="
              flex h-6 w-6
              items-center
              justify-center
              rounded-lg
              bg-violet-100
              text-violet-600

              dark:bg-violet-500/10
              dark:text-violet-300
            "
          >
            <Sparkles
              size={13}
            />
          </span>

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-violet-600

              dark:text-violet-300
            "
          >
            Pilotage JobBoost
          </span>
        </div>

        <h1
          className="
            text-[28px]
            font-semibold
            tracking-[-0.035em]
            text-zinc-950

            dark:text-zinc-50
          "
        >
          Tableau de bord
        </h1>

        <p
          className="
            mt-2
            max-w-2xl
            text-[13px]
            leading-6
            text-zinc-500

            dark:text-zinc-400
          "
        >
          Suivez les offres analysées,
          la compatibilité de votre profil
          et l&apos;avancement de vos
          candidatures.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={
            onRefresh
          }
          disabled={
            loading
          }
          className="
            dashboard-secondary-button
          "
        >
          <RefreshCw
            size={15}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />

          {loading
            ? 'Actualisation'
            : 'Actualiser'}
        </button>

        <Link
          href="/jobs"
          className="
            dashboard-primary-button
          "
        >
          Explorer les offres

          <ArrowUpRight
            size={15}
          />
        </Link>
      </div>
    </header>
  );
}