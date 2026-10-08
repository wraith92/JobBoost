import type {
  AutomationSourceConfig,
} from './automation.types';

export const AUTOMATION_SOURCES:
  AutomationSourceConfig[] = [
    {
      id:
        'FRANCE_TRAVAIL',

      label:
        'France Travail',

      description:
        'Collecte quotidienne des nouvelles offres puis analyse avec JobBoost.',

      ready:
        true,

      daily:
        true,
    },

    {
      id:
        'LINKEDIN',

      label:
        'LinkedIn',

      description:
        'Collecte LinkedIn à connecter ultérieurement.',

      ready:
        false,

      daily:
        false,
    },

    {
      id:
        'INDEED',

      label:
        'Indeed',

      description:
        'Collecte Indeed à connecter ultérieurement.',

      ready:
        false,

      daily:
        false,
    },

    {
      id:
        'HELLOWORK',

      label:
        'HelloWork',

      description:
        'Collecte HelloWork à connecter ultérieurement.',

      ready:
        false,

      daily:
        false,
    },

    {
      id:
        'WTTJ',

      label:
        'Welcome to the Jungle',

      description:
        'Collecte WTTJ à connecter ultérieurement.',

      ready:
        false,

      daily:
        false,
    },

    {
      id:
        'FREE_WORK',

      label:
        'Free-Work',

      description:
        'Collecte Free-Work à connecter ultérieurement.',

      ready:
        false,

      daily:
        false,
    },

    {
      id:
        'ADZUNA',

      label:
        'Adzuna',

      description:
        'Collecte Adzuna à connecter ultérieurement.',

      ready:
        false,

      daily:
        false,
    },

    {
      id:
        'JOOBLE',

      label:
        'Jooble',

      description:
        'Collecte Jooble à connecter ultérieurement.',

      ready:
        false,

      daily:
        false,
    },
  ];