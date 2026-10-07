export type DashboardPeriod =
  | 7
  | 30;

export type DashboardJob = {
  id: string;
  externalId: string;

  title: string;
  company: string | null;
  location: string | null;

  source: string;

  score: number | null;

  technologies: string[];
  matchedSkills: string[];
  missingSkills: string[];
};

export type DashboardRankingItem = {
  name: string;
  count: number;
};

export type ActivityPoint = {
  date: string;
  label: string;

  jobs: number;
  analyses: number;
  applications: number;
};

export type RecentApplication = {
  id: string;

  status: string;
  channel: string | null;

  appliedAt: string | null;
  followUpAt: string | null;
  createdAt: string;

  resumeId: string | null;
  coverLetterId: string | null;

  job: {
    id: string;
    externalId: string;

    title: string;
    company: string | null;
    location: string | null;

    source: string;

    score: number | null;
  };
};

export type DashboardStats = {
  jobs: {
    total: number;
    analyzed: number;
    compatible: number;
    remainingToAnalyze: number;
    averageScore: number;
  };

  applications: {
    total: number;
    ready: number;
    sent: number;
    responses: number;
    interviews: number;
    responseRate: number;
    interviewRate: number;
  };

  sources: {
    source: string;
    count: number;
  }[];

  topJobs: DashboardJob[];

  topTechnologies:
    DashboardRankingItem[];

  topMissingSkills:
    DashboardRankingItem[];

  activity: {
    periodDays: number;
    series: ActivityPoint[];
  };

  recentApplications:
    RecentApplication[];
};