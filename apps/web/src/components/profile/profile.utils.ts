export function cleanPayload<
  T extends Record<
    string,
    unknown
  >,
>(
  data: T,
) {
  return Object.fromEntries(
    Object.entries(
      data,
    ).filter(
      (
        [
          ,
          value,
        ],
      ) => {
        if (
          value ===
            undefined ||
          value === null
        ) {
          return false;
        }

        if (
          typeof value ===
            'string' &&
          value.trim() ===
            ''
        ) {
          return false;
        }

        return true;
      },
    ),
  );
}

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
    formatDate(
      startDate,
    );

  const end =
    current
      ? 'Aujourd’hui'
      : formatDate(
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

function formatDate(
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

export function normalizeUrl(
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