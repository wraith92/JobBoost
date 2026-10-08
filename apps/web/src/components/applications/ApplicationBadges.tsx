import {
  METHOD_LABELS,
  STATUS_LABELS,
} from './applications.constants';

import type {
  ApplicationMethod,
  ApplicationStatus,
} from './applications.types';

import {
  formatSource,
} from './applications.utils';

export function StatusBadge({
  status,
}: {
  status:
    ApplicationStatus;
}) {
  const styles:
    Record<
      ApplicationStatus,
      string
    > = {
    DRAFT:
      `
        border-zinc-200
        bg-zinc-50
        text-zinc-600

        dark:border-white/[0.07]
        dark:bg-white/[0.04]
        dark:text-zinc-300
      `,

    READY_TO_VALIDATE:
      `
        border-amber-200
        bg-amber-50
        text-amber-700

        dark:border-amber-400/15
        dark:bg-amber-500/10
        dark:text-amber-300
      `,

    APPROVED:
      `
        border-blue-200
        bg-blue-50
        text-blue-700

        dark:border-blue-400/15
        dark:bg-blue-500/10
        dark:text-blue-300
      `,

    SENDING:
      `
        border-violet-200
        bg-violet-50
        text-violet-700

        dark:border-violet-400/15
        dark:bg-violet-500/10
        dark:text-violet-300
      `,

    SENT:
      `
        border-emerald-200
        bg-emerald-50
        text-emerald-700

        dark:border-emerald-400/15
        dark:bg-emerald-500/10
        dark:text-emerald-300
      `,

    FAILED:
      `
        border-red-200
        bg-red-50
        text-red-700

        dark:border-red-400/15
        dark:bg-red-500/10
        dark:text-red-300
      `,

    RESPONSE_RECEIVED:
      `
        border-violet-200
        bg-violet-50
        text-violet-700

        dark:border-violet-400/15
        dark:bg-violet-500/10
        dark:text-violet-300
      `,

    INTERVIEW:
      `
        border-emerald-200
        bg-emerald-50
        text-emerald-700

        dark:border-emerald-400/15
        dark:bg-emerald-500/10
        dark:text-emerald-300
      `,

    REJECTED:
      `
        border-red-200
        bg-red-50
        text-red-700

        dark:border-red-400/15
        dark:bg-red-500/10
        dark:text-red-300
      `,

    FOLLOW_UP:
      `
        border-orange-200
        bg-orange-50
        text-orange-700

        dark:border-orange-400/15
        dark:bg-orange-500/10
        dark:text-orange-300
      `,

    ARCHIVED:
      `
        border-zinc-200
        bg-zinc-50
        text-zinc-500

        dark:border-white/[0.07]
        dark:bg-white/[0.04]
        dark:text-zinc-400
      `,
  };

  return (
    <span
      className={`
        application-badge
        ${styles[
          status
        ]}
      `}
    >
      {
        STATUS_LABELS[
          status
        ]
      }
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

  let classes =
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
    classes =
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
    classes =
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

  return (
    <span
      className={`
        application-badge
        ${classes}
      `}
    >
      {score}% match
    </span>
  );
}

export function SourceBadge({
  source,
}: {
  source: string;
}) {
  return (
    <span
      className="
        application-badge
        border-zinc-200
        bg-zinc-50
        text-zinc-500

        dark:border-white/[0.07]
        dark:bg-white/[0.04]
        dark:text-zinc-400
      "
    >
      {formatSource(
        source,
      )}
    </span>
  );
}

export function MethodBadge({
  method,
}: {
  method:
    ApplicationMethod;
}) {
  return (
    <span
      className="
        application-badge
        border-violet-200
        bg-violet-50
        text-violet-600

        dark:border-violet-400/15
        dark:bg-violet-500/10
        dark:text-violet-300
      "
    >
      {
        METHOD_LABELS[
          method
        ]
      }
    </span>
  );
}