import ResumeCandidateHeader
  from './ResumeCandidateHeader';

import ResumeEducationSection
  from './ResumeEducationSection';

import ResumeExperienceSection
  from './ResumeExperienceSection';

import ResumeProjectsSection
  from './ResumeProjectsSection';

import ResumeSkillsSection
  from './ResumeSkillsSection';

import ResumeSummarySection
  from './ResumeSummarySection';

import type {
  Resume,
} from './resume.types';

export default function ResumeDocument({
  resume,
}: {
  resume: Resume;
}) {
  const content =
    resume.content;

  // ============================================================
  // SKILLS FALLBACK
  // ============================================================

  const skills =
    content.skills &&
    content.skills.length > 0
      ? content.skills
      : resume.skills.map(
          (
            skill,
          ) => ({
            name:
              skill,

            category:
              null,

            level:
              null,
          }),
        );

  return (
    <article className="resume-document">

      <ResumeCandidateHeader
        resume={
          resume
        }
      />

      <ResumeSummarySection
        summary={
          content.summary ??
          resume.summary
        }
      />

      <ResumeSkillsSection
        skills={
          skills
        }
      />

      <ResumeExperienceSection
        experiences={
          content.experiences ??
          []
        }
      />

      <ResumeProjectsSection
        projects={
          content.projects ??
          []
        }
      />

      <ResumeEducationSection
        educations={
          content.educations ??
          []
        }
      />

    </article>
  );
}