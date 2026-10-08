import {
  ArrowUpRight,
  FileCheck2,
} from 'lucide-react';

import Link from 'next/link';

export default function ApplicationsHeader({
  filteredCount,
  totalCount,
}: {
  filteredCount:
    number;

  totalCount:
    number;
}) {
  return (
    <header
      className="
        flex flex-col
        gap-5
        sm:flex-row
        sm:items-end
        sm:justify-between
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
            <FileCheck2
              size={13}
            />
          </span>

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-violet-600

              dark:text-violet-300
            "
          >
            Suivi candidat
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
          Mes candidatures
        </h1>

        <p
          className="
            mt-2
            text-[12px]
            text-zinc-500

            dark:text-zinc-400
          "
        >
          {filteredCount}{' '}
          candidature
          {filteredCount !==
          1
            ? 's'
            : ''}{' '}
          affichée
          {filteredCount !==
          1
            ? 's'
            : ''}{' '}
          sur {totalCount}
        </p>
      </div>

      <Link
        href="/jobs"
        className="applications-primary-button"
      >
        Explorer les offres

        <ArrowUpRight
          size={14}
        />
      </Link>
    </header>
  );
}