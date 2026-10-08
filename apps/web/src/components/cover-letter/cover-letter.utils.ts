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

      if (
        Array.isArray(
          json.message,
        )
      ) {
        return json.message.join(
          ', ',
        );
      }
    } catch {
      // texte classique
    }

    return text;
  } catch {
    return fallback;
  }
}

export function formatDate(
  value:
    | string
    | undefined,
) {
  if (!value) {
    return null;
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
    return null;
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day:
        '2-digit',

      month:
        'long',

      year:
        'numeric',
    },
  ).format(
    date,
  );
}