import {
  PREPARATION_STEPS,
} from './jobs.constants';

import type {
  PrepareResponse,
  PreparedApplication,
  PreparationStepStatus,
} from './jobs.types';

export function normalizePrepareResponse(
  result: PrepareResponse,
): PreparedApplication {
  if (
    result.application
  ) {
    return {
      applicationId:
        result.application.id,

      status:
        result.application.status,

      resumeId:
        result.application.resumeId,

      coverLetterId:
        result.application
          .coverLetterId,
    };
  }

  if (
    !result.applicationId
  ) {
    throw new Error(
      "L'API n'a pas retourné l'identifiant de la candidature.",
    );
  }

  return {
    applicationId:
      result.applicationId,

    status:
      result.status ??
      'READY_TO_VALIDATE',

    resumeId:
      result.resumeId ??
      result.resume?.id ??
      null,

    coverLetterId:
      result.coverLetterId ??
      result.coverLetter?.id ??
      null,
  };
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
      // Texte classique.
    }

    return text;
  } catch {
    return fallback;
  }
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

    ADZUNA:
      'Adzuna',

    JOOBLE:
      'Jooble',

    FREE_WORK:
      'Free-Work',

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

export function getStepStatus(
  index: number,
  activeStep: number,
): PreparationStepStatus {
  if (
    activeStep >=
    PREPARATION_STEPS.length
  ) {
    return 'done';
  }

  if (
    index <
    activeStep
  ) {
    return 'done';
  }

  if (
    index ===
    activeStep
  ) {
    return 'active';
  }

  return 'pending';
}

export function getApplicationStatusLabel(
  status: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
    DRAFT:
      'Brouillon',

    READY_TO_VALIDATE:
      'Prête à valider',

    APPROVED:
      'Validée',

    SENDING:
      'Envoi en cours',

    SENT:
      'Envoyée',

    FAILED:
      'Échec',

    RESPONSE_RECEIVED:
      'Réponse reçue',

    INTERVIEW:
      'Entretien',

    REJECTED:
      'Refus',

    FOLLOW_UP:
      'À relancer',

    ARCHIVED:
      'Archivée',
  };

  return (
    labels[status] ??
    status
  );
}