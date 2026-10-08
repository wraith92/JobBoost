export const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export const PREPARE_TIMEOUT_MS =
  180_000;

export const PREPARATION_STEPS = [
  {
    label:
      "Analyse de l'offre",

    description:
      'Lecture et compréhension des besoins du poste.',
  },

  {
    label:
      'Matching avec le profil',

    description:
      'Comparaison avec les compétences et expériences.',
  },

  {
    label:
      'CV personnalisé',

    description:
      'Sélection des expériences et compétences pertinentes.',
  },

  {
    label:
      'Lettre de motivation',

    description:
      'Génération contrôlée de la lettre.',
  },

  {
    label:
      'Création de la candidature',

    description:
      'Association de l’offre, du CV et de la lettre.',
  },
] as const;