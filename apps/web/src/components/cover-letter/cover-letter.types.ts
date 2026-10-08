export type CoverLetter = {
  id: string;

  jobId: string;

  resumeId:
    | string
    | null;

  title: string;

  content: string;

  status: string;

  createdAt?: string;

  updatedAt?: string;

  job?: {
    id: string;

    title: string;

    company:
      | string
      | null;

    location?:
      | string
      | null;

    source?:
      | string;

    analysis?: {
      score:
        | number
        | null;
    } | null;
  };
};

export type CreatedApplication = {
  id: string;

  status?: string;
};