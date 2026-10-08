export function formatPeriod(
  startDate:
    | string
    | null,

  endDate:
    | string
    | null,

  current = false,
) {
  const start =
    formatMonthYear(
      startDate,
    );

  const end =
    current
      ? 'Aujourd’hui'
      : formatMonthYear(
          endDate,
        );

  if (
    start &&
    end
  ) {
    return `${start} — ${end}`;
  }

  return (
    start ||
    end ||
    ''
  );
}

export function formatMonthYear(
  value:
    | string
    | null,
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      month:
        'short',

      year:
        'numeric',
    },
  ).format(
    date,
  );
}

export async function readErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const text =
      await response.text();

    if (!text) {
      return fallback;
    }

    try {
      const json =
        JSON.parse(
          text,
        );

      if (
        typeof json.message ===
        'string'
      ) {
        return json.message;
      }
    } catch {
      // texte classique
    }

    return text;
  } catch {
    return fallback;
  }
}

export function normalizeExternalUrl(
  value:
    | string
    | null,
) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith(
      'http://',
    ) ||
    value.startsWith(
      'https://',
    )
  ) {
    return value;
  }

  return `https://${value}`;
}