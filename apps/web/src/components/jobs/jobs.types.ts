export type JobAnalysis = {
  id: string;
  score: number | null;

  requiredSkills: string[];
  optionalSkills: string[];

  matchedSkills: string[];
  missingSkills: string[];

  technologies: string[];

  summary: string | null;
};

export type Job = {
  id: string;

  source: string;
  externalId: string;

  title: string;

  company: string | null;
  description: string | null;

  location: string | null;
  department: string | null;

  contractType: string | null;
  experience: string | null;
  salary: string | null;

  url: string | null;

  applicationMethod?:
    | string
    | null;

  applicationUrl?:
    | string
    | null;

  contactEmail?:
    | string
    | null;

  sourceCreatedAt:
    | string
    | null;

  createdAt: string;

  analysis:
    | JobAnalysis
    | null;
};

export type ExistingApplication = {
  id: string;

  jobId: string;

  status: string;

  resumeId:
    | string
    | null;

  coverLetterId:
    | string
    | null;
};

export type PreparedApplication = {
  applicationId: string;

  status: string;

  resumeId:
    | string
    | null;

  coverLetterId:
    | string
    | null;
};

export type PrepareResponse = {
  alreadyPrepared: boolean;

  message?: string;

  score?:
    | number
    | null;

  application?: {
    id: string;

    jobId?: string;

    status: string;

    resumeId:
      | string
      | null;

    coverLetterId:
      | string
      | null;
  };

  applicationId?: string;

  status?: string;

  resumeId?:
    | string
    | null;

  coverLetterId?:
    | string
    | null;

  resume?: {
    id: string;
  } | null;

  coverLetter?: {
    id: string;
  } | null;
};

export type SendResponse = {
  application?: {
    id: string;

    status: string;

    resumeId?:
      | string
      | null;

    coverLetterId?:
      | string
      | null;
  };

  action:
    | 'OPEN_URL'
    | 'EMAIL_PENDING'
    | 'MANUAL';

  method: string;

  url?:
    | string
    | null;

  email?:
    | string
    | null;
};

export type PreparationStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export type PreparationStepStatus =
  | 'pending'
  | 'active'
  | 'done';

export type DocumentTab =
  | 'resume'
  | 'letter';

export type DocumentsModalState = {
  open: boolean;
  jobTitle: string;
  applicationId: string | null;
  resumeId: string | null;
  coverLetterId: string | null;
  initialTab: DocumentTab;
};

export type ActionFeedback = {
  type:
    | 'success'
    | 'error'
    | 'info';

  message: string;
};

export type PageSize =
  | 10
  | 20
  | 50;