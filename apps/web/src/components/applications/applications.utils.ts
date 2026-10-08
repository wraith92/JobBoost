import {
  STATUS_LABELS,
} from './applications.constants';

import type {
  ApplicationStatus,
} from './applications.types';

export function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day:
        '2-digit',

      month:
        '2-digit',

      year:
        'numeric',
    },
  ).format(
    new Date(
      value,
    ),
  );
}

export function formatSource(
  source: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
    FRANCE_TRAVAIL:
      'France Travail',

    FREE_WORK:
      'Free-Work',

    JOOBLE:
      'Jooble',

    ADZUNA:
      'Adzuna',

    HELLOWORK:
      'HelloWork',

    WTTJ:
      'Welcome to the Jungle',

    LINKEDIN:
      'LinkedIn',

    INDEED:
      'Indeed',
  };

  return (
    labels[source] ??
    source
  );
}

export function getStatusOptions(
  currentStatus:
    ApplicationStatus,
): ApplicationStatus[] {
  const allStatuses =
    Object.keys(
      STATUS_LABELS,
    ) as ApplicationStatus[];

  const workflowStatuses =
    new Set<ApplicationStatus>(
      [
        'APPROVED',
        'SENDING',
        'FAILED',
      ],
    );

  return allStatuses.filter(
    (
      status,
    ) =>
      !workflowStatuses.has(
        status,
      ) ||
      status ===
        currentStatus,
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