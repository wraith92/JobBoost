import {
  BrainCircuit,
} from 'lucide-react';

import {
  formatSource,
  getApplicationStatusLabel,
} from './jobs.utils';

export function SourceBadge({
  source,
}: {
  source: string;
}) {
  return (
    <span
      className="
        jobs-badge
        border-violet-200
        bg-violet-50
        text-violet-700

        dark:border-violet-400/15
        dark:bg-violet-500/10
        dark:text-violet-300
      "
    >
      {formatSource(
        source,
      )}
    </span>
  );
}

export function AnalysisBadge() {
  return (
    <span
      className="
        jobs-badge
        border-blue-200
        bg-blue-50
        text-blue-700

        dark:border-blue-400/15
        dark:bg-blue-500/10
        dark:text-blue-300
      "
    >
      <BrainCircuit
        size={11}
      />

      IA analysée
    </span>
  );
}

export function ApplicationMethodBadge({
  method,
}: {
  method: string;
}) {
  const labels:
    Record<
      string,
      string
    > = {
    UNKNOWN:
      'Canal à définir',

    FRANCE_TRAVAIL:
      'France Travail',

    PARTNER:
      'Site partenaire',

    EXTERNAL_SITE:
      'Site externe',

    EMAIL:
      'Email',

    MANUAL:
      'Manuel',
  };

  return (
    <span
      className="
        jobs-badge
        border-zinc-200
        bg-zinc-50
        text-zinc-500

        dark:border-white/[0.07]
        dark:bg-white/[0.04]
        dark:text-zinc-400
      "
    >
      {labels[method] ??
        method}
    </span>
  );
}

export function ApplicationStatusBadge({
  status,
}: {
  status: string;
}) {
  let classes =
    `
      border-zinc-200
      bg-zinc-50
      text-zinc-600

      dark:border-white/[0.07]
      dark:bg-white/[0.04]
      dark:text-zinc-300
    `;

  if (
    status ===
    'READY_TO_VALIDATE'
  ) {
    classes =
      `
        border-amber-200
        bg-amber-50
        text-amber-700

        dark:border-amber-400/15
        dark:bg-amber-500/10
        dark:text-amber-300
      `;
  }

  if (
    status ===
      'SENT' ||
    status ===
      'INTERVIEW'
  ) {
    classes =
      `
        border-emerald-200
        bg-emerald-50
        text-emerald-700

        dark:border-emerald-400/15
        dark:bg-emerald-500/10
        dark:text-emerald-300
      `;
  }

  if (
    status ===
      'FAILED' ||
    status ===
      'REJECTED'
  ) {
    classes =
      `
        border-red-200
        bg-red-50
        text-red-700

        dark:border-red-400/15
        dark:bg-red-500/10
        dark:text-red-300
      `;
  }

  return (
    <span
      className={`
        jobs-badge
        ${classes}
      `}
    >
      {getApplicationStatusLabel(
        status,
      )}
    </span>
  );
}

export function ScoreBadge({
  score,
}: {
  score:
    | number
    | null;
}) {
  if (
    score === null
  ) {
    return null;
  }

  let styles =
    `
      border-red-200
      bg-red-50
      text-red-700

      dark:border-red-400/15
      dark:bg-red-500/10
      dark:text-red-300
    `;

  if (
    score >= 70
  ) {
    styles =
      `
        border-emerald-200
        bg-emerald-50
        text-emerald-700

        dark:border-emerald-400/15
        dark:bg-emerald-500/10
        dark:text-emerald-300
      `;
  } else if (
    score >= 50
  ) {
    styles =
      `
        border-violet-200
        bg-violet-50
        text-violet-700

        dark:border-violet-400/15
        dark:bg-violet-500/10
        dark:text-violet-300
      `;
  } else if (
    score >= 30
  ) {
    styles =
      `
        border-amber-200
        bg-amber-50
        text-amber-700

        dark:border-amber-400/15
        dark:bg-amber-500/10
        dark:text-amber-300
      `;
  }

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5 py-1
        text-[10px]
        font-bold
        ${styles}
      `}
    >
      {score}% match
    </span>
  );
}