import type {
  ApplicationMethod,
  ApplicationStatus,
} from './applications.types';

export const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export const STATUS_LABELS:
  Record<
    ApplicationStatus,
    string
  > = {
  DRAFT:
    'Brouillon',

  READY_TO_VALIDATE:
    'À valider',

  APPROVED:
    'Validée',

  SENDING:
    'En cours d’envoi',

  SENT:
    'Envoyée',

  FAILED:
    'Échec d’envoi',

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

export const METHOD_LABELS:
  Record<
    ApplicationMethod,
    string
  > = {
  UNKNOWN:
    'Canal à définir',

  EMAIL:
    'Email',

  FRANCE_TRAVAIL:
    'France Travail',

  PARTNER:
    'Site partenaire',

  EXTERNAL_SITE:
    'Site externe',

  MANUAL:
    'Manuel',
};