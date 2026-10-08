export type Resume = {
  id: string;

  title: string;

  summary: string | null;

  skills: string[];

  status: string;

  jobId: string;

  content: {
    candidate: {
      firstName: string;
      lastName: string;

      email: string | null;
      phone: string | null;
      location: string | null;

      website: string | null;
      github: string | null;
      linkedin: string | null;
    };

    targetJob: {
      title: string;

      company: string | null;
      location: string | null;

      compatibilityScore:
        | number
        | null;
    };

    summary: string | null;

    skills: {
      name: string;

      category:
        | string
        | null;

      level:
        | number
        | null;
    }[];

    experiences: {
      id: string;

      company: string;
      title: string;

      location:
        | string
        | null;

      startDate:
        | string
        | null;

      endDate:
        | string
        | null;

      current: boolean;

      description:
        | string
        | null;

      bullets: string[];
    }[];

    projects: {
      id: string;

      name: string;

      description:
        | string
        | null;

      technologies: string[];

      url:
        | string
        | null;
    }[];

    educations: {
      id: string;

      school: string;
      degree: string;

      field:
        | string
        | null;

      startDate:
        | string
        | null;

      endDate:
        | string
        | null;

      description:
        | string
        | null;
    }[];
  };
};