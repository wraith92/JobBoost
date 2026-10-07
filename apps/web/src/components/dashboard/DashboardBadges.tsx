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
    return (
      <span className="text-xs text-zinc-400">
        —
      </span>
    );
  }

  let styles =
    'bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300';

  if (
    score >= 70
  ) {
    styles =
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
  } else if (
    score >= 50
  ) {
    styles =
      'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300';
  } else if (
    score >= 30
  ) {
    styles =
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
  } else {
    styles =
      'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300';
  }

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[10px]
        font-bold
        ${styles}
      `}
    >
      {score}%
    </span>
  );
}

export function ApplicationStatusBadge({
  status,
}: {
  status: string;
}) {
  const labels:
    Record<
      string,
      string
    > = {
    DRAFT:
      'Brouillon',

    READY_TO_VALIDATE:
      'À valider',

    APPROVED:
      'Validée',

    SENDING:
      'En cours',

    SENT:
      'Envoyée',

    FAILED:
      'Échec',

    RESPONSE_RECEIVED:
      'Réponse',

    INTERVIEW:
      'Entretien',

    REJECTED:
      'Refus',

    FOLLOW_UP:
      'À relancer',

    ARCHIVED:
      'Archivée',
  };

  const styles:
    Record<
      string,
      string
    > = {
    READY_TO_VALIDATE:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',

    APPROVED:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',

    SENT:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',

    RESPONSE_RECEIVED:
      'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',

    INTERVIEW:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',

    REJECTED:
      'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',

    FAILED:
      'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',

    FOLLOW_UP:
      'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[10px]
        font-semibold

        ${
          styles[
            status
          ] ??
          'bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300'
        }
      `}
    >
      {labels[
        status
      ] ??
        status}
    </span>
  );
}