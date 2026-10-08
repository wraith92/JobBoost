export type AutomationSource =
  | 'FRANCE_TRAVAIL'
  | 'LINKEDIN'
  | 'INDEED'
  | 'HELLOWORK'
  | 'WTTJ'
  | 'FREE_WORK'
  | 'ADZUNA'
  | 'JOOBLE';

export type AutomationSourceConfig = {
  id: AutomationSource;

  label: string;

  description: string;

  ready: boolean;

  daily: boolean;
};

export type AutomationFeedStatus =
  | 'collecting'
  | 'imported'
  | 'analyzing'
  | 'ready'
  | 'error';

export type AutomationFeedItem = {
  id: string;

  externalId?: string;

  title: string;

  company?: string | null;

  location?: string | null;

  source: AutomationSource;

  status: AutomationFeedStatus;

  score?: number | null;

  message?: string;
};