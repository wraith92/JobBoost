import type {
  ApplicationMethod,
  ApplicationStatus,
} from '../applications.types';

export type ApplicationDetail = {
  id: string;

  status: ApplicationStatus;

  channel: string | null;

  notes: string | null;

  appliedAt: string | null;

  followUpAt: string | null;

  createdAt: string;

  updatedAt?: string;

  job: {
    id: string;

    title: string;

    company: string | null;

    location: string | null;

    source: string;

    url?: string | null;

    applicationMethod?:
      ApplicationMethod;

    applicationUrl?:
      string | null;

    contactEmail?:
      string | null;

    analysis: {
      score: number | null;

      summary?: string | null;

      matchedSkills?: string[];

      missingSkills?: string[];

      technologies?: string[];
    } | null;
  };

  resume: {
    id: string;

    title: string;

    status?: string;

    createdAt?: string;
  } | null;

  coverLetter: {
    id: string;

    title: string;

    status?: string;

    createdAt?: string;
  } | null;
};

export type SaveFeedback = {
  type:
    | 'success'
    | 'error';

  message: string;
};