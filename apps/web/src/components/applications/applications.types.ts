export type ApplicationStatus =
  | 'DRAFT'
  | 'READY_TO_VALIDATE'
  | 'APPROVED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED'
  | 'RESPONSE_RECEIVED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'FOLLOW_UP'
  | 'ARCHIVED';

export type ApplicationMethod =
  | 'UNKNOWN'
  | 'EMAIL'
  | 'FRANCE_TRAVAIL'
  | 'PARTNER'
  | 'EXTERNAL_SITE'
  | 'MANUAL';

export type Application = {
  id: string;

  status: ApplicationStatus;

  channel: string | null;

  notes: string | null;

  appliedAt: string | null;

  followUpAt: string | null;

  createdAt: string;

  updatedAt: string;

  job: {
    id: string;

    title: string;

    company: string | null;

    location: string | null;

    source: string;

    url: string | null;

    applicationMethod:
      ApplicationMethod;

    applicationUrl:
      string | null;

    contactEmail:
      string | null;

    analysis: {
      score: number | null;
    } | null;
  };

  resume: {
    id: string;

    title: string;

    status: string;

    createdAt: string;
  } | null;

  coverLetter: {
    id: string;

    title: string;

    status: string;

    createdAt: string;
  } | null;
};

export type SendApplicationResponse = {
  application?: {
    id: string;

    status:
      ApplicationStatus;
  };

  action:
    | 'OPEN_URL'
    | 'EMAIL_PENDING'
    | 'MANUAL';

  method: string;

  url?: string | null;

  email?: string | null;
};

export type PageSize =
  | 10
  | 20
  | 50;