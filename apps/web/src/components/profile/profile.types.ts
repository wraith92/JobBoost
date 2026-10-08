export type Experience = {
  id: string;

  company: string;

  title: string;

  location:
    | string
    | null;

  startDate: string;

  endDate:
    | string
    | null;

  current: boolean;

  description:
    | string
    | null;

  bullets: string[];
};

export type Education = {
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
};

export type Skill = {
  id: string;

  name: string;

  category:
    | string
    | null;

  level:
    | number
    | null;
};

export type Project = {
  id: string;

  name: string;

  description:
    | string
    | null;

  technologies: string[];

  url:
    | string
    | null;

  githubUrl:
    | string
    | null;

  startDate:
    | string
    | null;

  endDate:
    | string
    | null;
};

export type Profile = {
  id: string;

  firstName: string;
  targetRoles: string[];
  lastName: string;

  email:
    | string
    | null;

  phone:
    | string
    | null;

  location:
    | string
    | null;

  headline:
    | string
    | null;

  summary:
    | string
    | null;

  website:
    | string
    | null;

  linkedin:
    | string
    | null;

  github:
    | string
    | null;

  experiences: Experience[];

  educations: Education[];

  skills: Skill[];

  projects: Project[];
};

export type ProfileForm = {
  firstName: string;
  targetRoles: string;
  lastName: string;

  email: string;

  phone: string;

  location: string;

  headline: string;

  summary: string;

  website: string;

  linkedin: string;

  github: string;
};

export type ExperienceForm = {
  company: string;

  title: string;

  location: string;

  startDate: string;

  endDate: string;

  current: boolean;

  description: string;

  bullets: string;
};

export type EducationForm = {
  school: string;

  degree: string;

  field: string;

  startDate: string;

  endDate: string;

  description: string;
};

export type SkillForm = {
  name: string;

  category: string;

  level: string;
};

export type ProjectForm = {
  name: string;

  description: string;

  technologies: string;

  url: string;

  githubUrl: string;

  startDate: string;

  endDate: string;
};