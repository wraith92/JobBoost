'use client';

import { useEffect, useState } from 'react';
import {
  useParams,
  useRouter,
} from 'next/navigation';

const API_URL = 'http://localhost:3001';

type Resume = {
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
      compatibilityScore: number | null;
    };

    summary: string | null;

    skills: {
      name: string;
      category: string | null;
      level: number | null;
    }[];

    experiences: {
      id: string;
      company: string;
      title: string;
      location: string | null;
      startDate: string | null;
      endDate: string | null;
      current: boolean;
      description: string | null;
      bullets: string[];
    }[];

    projects: {
      id: string;
      name: string;
      description: string | null;
      technologies: string[];
      url: string | null;
    }[];

    educations: {
      id: string;
      school: string;
      degree: string;
      field: string | null;
      startDate: string | null;
      endDate: string | null;
      description: string | null;
    }[];
  };
};

export default function ResumePage() {
  const params = useParams();
  const resumeId = params.id as string;

  const [resume, setResume] =
    useState<Resume | null>(null);

  const [loading, setLoading] =
    useState(true);
    const router = useRouter();

const [
  generatingLetter,
  setGeneratingLetter,
] = useState(false);
async function generateCoverLetter() {
  if (!resume) {
    return;
  }

  try {
    setGeneratingLetter(true);

    const response = await fetch(
      `${API_URL}/cover-letter/jobs/${resume.jobId}/generate`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          resumeId: resume.id,
        }),
      },
    );

    if (!response.ok) {
      const message =
        await response.text();

      throw new Error(
        message ||
          'Impossible de générer la lettre',
      );
    }

    const letter =
      await response.json();

    if (!letter.id) {
      throw new Error(
        'ID de lettre introuvable',
      );
    }

    router.push(
      `/cover-letter/${letter.id}`,
    );
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : 'Erreur pendant la génération',
    );
  } finally {
    setGeneratingLetter(false);
  }
}

  useEffect(() => {
    async function loadResume() {
      try {
        const response = await fetch(
          `${API_URL}/resume/${resumeId}`,
        );

        if (!response.ok) {
          throw new Error(
            'Impossible de charger le CV',
          );
        }

        const data =
          (await response.json()) as Resume;

        setResume(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (resumeId) {
      void loadResume();
    }
  }, [resumeId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        Chargement du CV...
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        CV introuvable.
      </main>
    );
  }

  const { content } = resume;

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-4xl">
        {/* BARRE ACTIONS */}
        {/* BARRE ACTIONS */}
<div className="mb-4 flex items-center justify-between">
  <div>
    <p className="text-sm text-gray-500">
      CV personnalisé pour
    </p>

    <h1 className="font-semibold text-gray-900">
      {content.targetJob.title}
    </h1>
  </div>

  <div className="flex items-center gap-3">
    {content.targetJob.compatibilityScore !== null && (
      <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
        {content.targetJob.compatibilityScore} %
      </span>
    )}

    <button
      type="button"
      onClick={generateCoverLetter}
      disabled={generatingLetter}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {generatingLetter
        ? 'Génération...'
        : 'Générer la lettre'}
    </button>

    <a
      href={`${API_URL}/resume/${resume.id}/pdf`}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
    >
      Télécharger le PDF
    </a>
  </div>
</div>
        {/* CV */}
        <div className="bg-white p-10 shadow-lg">
          {/* HEADER */}
          {/* HEADER */}
<header className="border-b border-gray-200 pb-6">
  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
    {content.candidate.firstName}{' '}
    {content.candidate.lastName}
  </h2>

  <p className="mt-1 text-lg font-medium text-gray-700">
    {resume.title}
  </p>

  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600">
    {content.candidate.location && (
      <span>
        {content.candidate.location}
      </span>
    )}

    {content.candidate.email && (
      <>
        <span className="text-gray-300">
          •
        </span>

        <a
          href={`mailto:${content.candidate.email}`}
          className="hover:text-gray-900"
        >
          {content.candidate.email}
        </a>
      </>
    )}

    {content.candidate.phone && (
      <>
        <span className="text-gray-300">
          •
        </span>

        <a
          href={`tel:${content.candidate.phone}`}
          className="hover:text-gray-900"
        >
          {content.candidate.phone}
        </a>
      </>
    )}

    {content.candidate.website && (
      <>
        <span className="text-gray-300">
          •
        </span>

        <a
          href={content.candidate.website}
          target="_blank"
          rel="noreferrer"
          className="hover:text-gray-900"
        >
          Portfolio
        </a>
      </>
    )}

    {content.candidate.github && (
      <>
        <span className="text-gray-300">
          •
        </span>

        <a
          href={content.candidate.github}
          target="_blank"
          rel="noreferrer"
          className="hover:text-gray-900"
        >
          GitHub
        </a>
      </>
    )}

    {content.candidate.linkedin && (
      <>
        <span className="text-gray-300">
          •
        </span>

        <a
          href={content.candidate.linkedin}
          target="_blank"
          rel="noreferrer"
          className="hover:text-gray-900"
        >
          LinkedIn
        </a>
      </>
    )}
  </div>
</header>

          {/* PROFIL */}
          {content.summary && (
            <section className="mt-7">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Profil
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-700">
                {content.summary}
              </p>
            </section>
          )}

          {/* COMPETENCES */}
          {content.skills.length > 0 && (
            <section className="mt-7">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Compétences pertinentes
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {content.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-800"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCES */}
          {content.experiences.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Expériences professionnelles
              </h3>

              <div className="mt-4 space-y-6">
                {content.experiences.map(
                  (experience) => (
                    <article
                      key={experience.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {experience.title}
                          </h4>

                          <p className="text-sm font-medium text-gray-700">
                            {experience.company}
                          </p>
                        </div>

                        <div className="text-right text-xs text-gray-500">
                          {formatPeriod(
                            experience.startDate,
                            experience.endDate,
                            experience.current,
                          )}

                          {experience.location && (
                            <div>
                              {experience.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {experience.description && (
                        <p className="mt-2 text-sm leading-5 text-gray-600">
                          {experience.description}
                        </p>
                      )}

                      {experience.bullets.length >
                        0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {experience.bullets.map(
                            (bullet, index) => (
                              <li key={index}>
                                {bullet}
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </article>
                  ),
                )}
              </div>
            </section>
          )}

          {/* PROJETS */}
          {content.projects.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Projets pertinents
              </h3>

              <div className="mt-4 space-y-5">
                {content.projects.map(
                  (project) => (
                    <article key={project.id}>
                      <h4 className="font-semibold text-gray-900">
                        {project.name}
                      </h4>

                      {project.description && (
                        <p className="mt-1 text-sm leading-5 text-gray-600">
                          {project.description}
                        </p>
                      )}

                      {project.technologies.length >
                        0 && (
                        <p className="mt-2 text-xs text-gray-500">
                          {project.technologies.join(
                            ' • ',
                          )}
                        </p>
                      )}
                    </article>
                  ),
                )}
              </div>
            </section>
          )}

          {/* FORMATION */}
          {content.educations.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Formation
              </h3>

              <div className="mt-4 space-y-4">
                {content.educations.map(
                  (education) => (
                    <article
                      key={education.id}
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {education.degree}
                          </h4>

                          <p className="text-sm text-gray-700">
                            {education.school}
                            {education.field
                              ? ` — ${education.field}`
                              : ''}
                          </p>
                        </div>

                        <span className="text-xs text-gray-500">
                          {formatPeriod(
                            education.startDate,
                            education.endDate,
                            false,
                          )}
                        </span>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function formatPeriod(
  startDate: string | null,
  endDate: string | null,
  current: boolean,
) {
  const format = (
    value: string | null,
  ) => {
    if (!value) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        month: 'short',
        year: 'numeric',
      },
    ).format(new Date(value));
  };

  const start = format(startDate);

  const end = current
    ? 'Aujourd’hui'
    : format(endDate);

  if (!start && !end) {
    return '';
  }

  if (!end) {
    return start;
  }

  return `${start} — ${end}`;
}