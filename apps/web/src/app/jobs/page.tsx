'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Job = {
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

  sourceCreatedAt: string | null;
  createdAt: string;
  analysis: {
  id: string;
  score: number | null;
  requiredSkills: string[];
  optionalSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  technologies: string[];
  summary: string | null;
} | null;
};



const API_URL = 'http://localhost:3001';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('ALL');
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
  const [compatibilityFilter, setCompatibilityFilter] = useState('ALL');
  const router = useRouter();

const [generatingResumeId, setGeneratingResumeId] =
  useState<string | null>(null);
  

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch(`${API_URL}/jobs`);

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des offres');
        }

        const data = (await response.json()) as Job[];

        setJobs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    void loadJobs();
  }, []);
 async function analyzeJob(jobId: string) {
  try {
    console.log('Début analyse IA :', jobId);

    setAnalyzingJobId(jobId);

    const response = await fetch(
      `${API_URL}/llm/jobs/${jobId}/analyze`,
      {
        method: 'POST',
      },
    );

    console.log('Status API :', response.status);

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'Erreur API analyse :',
        errorText,
      );

      throw new Error(
        `Erreur analyse IA : ${response.status}`,
      );
    }

    const result = await response.json();

    console.log(
      'Résultat analyse IA :',
      result,
    );

    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              analysis: result.analysis,
            }
          : job,
      ),
    );
  } catch (error) {
    console.error(
      "Erreur pendant l'analyse :",
      error,
    );

    alert(
      "Impossible d'analyser cette offre avec l'IA.",
    );
  } finally {
    setAnalyzingJobId(null);
  }
}

  const sources = useMemo(() => {
    return Array.from(
      new Set(jobs.map((job) => job.source)),
    ).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const text = [
        job.title,
        job.company,
        job.location,
        job.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase(),
      );

      const matchesSource =
        source === 'ALL' ||
        job.source === source;

      return matchesSearch && matchesSource;
    });
  }, [jobs, search, source]);
  const sortedJobs = useMemo(() => {
  const filteredByScore = filteredJobs.filter((job) => {
    const score = job.analysis?.score;

    if (compatibilityFilter === 'ALL') {
      return true;
    }

    if (compatibilityFilter === 'NOT_ANALYZED') {
      return !job.analysis;
    }

    if (score === null || score === undefined) {
      return false;
    }

    if (compatibilityFilter === 'HIGH') {
      return score >= 75;
    }

    if (compatibilityFilter === 'GOOD') {
      return score >= 50 && score < 75;
    }

    if (compatibilityFilter === 'MEDIUM') {
      return score >= 30 && score < 50;
    }

    if (compatibilityFilter === 'LOW') {
      return score < 30;
    }

    return true;
  });

  return [...filteredByScore].sort((a, b) => {
    const scoreA = a.analysis?.score ?? -1;
    const scoreB = b.analysis?.score ?? -1;

    return scoreB - scoreA;
  });
}, [filteredJobs, compatibilityFilter]);
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p>Chargement des offres...</p>
      </main>
    );
  }

  function getScoreStyle(score: number) {
  if (score >= 75) {
    return {
      text: 'text-green-700',
      bar: 'bg-green-500',
      badge: 'bg-green-100 text-green-700',
      label: 'Très compatible',
    };
  }

  if (score >= 50) {
    return {
      text: 'text-orange-600',
      bar: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-700',
      label: 'Compatible',
    };
  }

  if (score >= 30) {
    return {
      text: 'text-yellow-600',
      bar: 'bg-yellow-500',
      badge: 'bg-yellow-100 text-yellow-700',
      label: 'Compatibilité moyenne',
    };
  }

  return {
    text: 'text-red-600',
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Faible compatibilité',
  };
}
async function generateResume(jobId: string) {
  try {
    setGeneratingResumeId(jobId);

    const response = await fetch(
      `${API_URL}/resume/jobs/${jobId}/generate`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        error ||
          'Impossible de générer le CV',
      );
    }

    const data = await response.json();

    const resumeId =
      data.resume?.id ?? data.id;

    if (!resumeId) {
      throw new Error(
        'ID du CV introuvable',
      );
    }

    router.push(
      `/resume/${resumeId}`,
    );
  } catch (error) {
    console.error(
      'Erreur génération CV :',
      error,
    );

    alert(
      error instanceof Error
        ? error.message
        : 'Erreur pendant la génération du CV',
    );
  } finally {
    setGeneratingResumeId(null);
  }
}


  return (
  <main className="min-h-screen bg-gray-50 p-6 md:p-10">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Offres d&apos;emploi
        </h1>

        <p className="mt-2 text-gray-600">
          {filteredJobs.length} offre(s) affichée(s) sur {jobs.length}
        </p>
      </div>

      {/* Filtres */}
<div className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row">
  <input
    type="text"
    placeholder="React, Node.js, Data, entreprise..."
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
  />

  {/* Filtre source */}
  <select
    value={source}
    onChange={(event) => setSource(event.target.value)}
    className="rounded-lg border border-gray-300 px-4 py-3"
  >
    <option value="ALL">
      Toutes les sources
    </option>

    {sources.map((item) => (
      <option
        key={item}
        value={item}
      >
        {formatSource(item)}
      </option>
    ))}
  </select>

  {/* Filtre compatibilité */}
  <select
    value={compatibilityFilter}
    onChange={(event) =>
      setCompatibilityFilter(event.target.value)
    }
    className="rounded-lg border border-gray-300 px-4 py-3"
  >
    <option value="ALL">
      Toutes les compatibilités
    </option>

    <option value="HIGH">
      Très compatibles — 75 %+
    </option>

    <option value="GOOD">
      Compatibles — 50 à 74 %
    </option>

    <option value="MEDIUM">
      Moyennes — 30 à 49 %
    </option>

    <option value="LOW">
      Faibles — moins de 30 %
    </option>

    <option value="NOT_ANALYZED">
      À analyser
    </option>
  </select>
</div>

     {/* Liste des offres */}
<div className="space-y-4">
  {sortedJobs.map((job) => {
    const score = job.analysis?.score ?? 0;
    const scoreStyle = getScoreStyle(score);

    return (
      <article
        key={job.id}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          {/* Contenu */}
          <div className="min-w-0 flex-1">
            {/* Source + contrat */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                {formatSource(job.source)}
              </span>

              {job.contractType && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  {job.contractType}
                </span>
              )}

              {job.analysis && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  IA analysée
                </span>
              )}
            </div>

            {/* Titre */}
            <h2 className="text-xl font-semibold text-gray-900">
              {job.title}
            </h2>

            {/* Infos */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
              {job.company && (
                <span>
                  🏢 {job.company}
                </span>
              )}

              {job.location && (
                <span>
                  📍 {job.location}
                </span>
              )}

              {job.sourceCreatedAt && (
                <span>
                  📅 {formatDate(job.sourceCreatedAt)}
                </span>
              )}

              {job.salary && (
                <span>
                  💰 {job.salary}
                </span>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                {cleanJobText(job.description)}
              </p>
            )}

            {/* Analyse IA */}
            {job.analysis && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                {/* SCORE */}
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Compatibilité
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${scoreStyle.badge}`}
                      >
                        {scoreStyle.label}
                      </span>
                    </div>

                    <span
                      className={`text-2xl font-bold ${scoreStyle.text}`}
                    >
                      {score} %
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${scoreStyle.bar}`}
                      style={{
                        width: `${score}%`,
                      }}
                    />
                  </div>
                </div>

                {/* RESUME IA */}
                {job.analysis.summary && (
                  <div className="mb-4">
                    <h4 className="mb-1 text-sm font-semibold text-gray-900">
                      Résumé IA
                    </h4>

                    <p className="text-sm text-gray-600">
                      {job.analysis.summary}
                    </p>
                  </div>
                )}

                {/* COMPETENCES DEMANDEES */}
                {job.analysis.requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                      Compétences demandées
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {job.analysis.requiredSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700"
                          >
                            {skill}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* COMPETENCES CORRESPONDANTES */}
                {job.analysis.matchedSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-green-700">
                      Compétences correspondantes
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {job.analysis.matchedSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                          >
                            ✓ {skill}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* COMPETENCES MANQUANTES */}
                {job.analysis.missingSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-red-700">
                      Compétences manquantes
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {job.analysis.missingSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                          >
                            ✕ {skill}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* TECHNOLOGIES */}
                {job.analysis.technologies.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                      Technologies détectées
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {job.analysis.technologies.map(
                        (tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                          >
                            {tech}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={() => analyzeJob(job.id)}
              disabled={analyzingJobId === job.id}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzingJobId === job.id
                ? 'Analyse en cours...'
                : job.analysis
                  ? 'Ré-analyser avec IA'
                  : 'Analyser avec IA'}
            </button>
            <button
  type="button"
  onClick={() =>
    generateResume(job.id)
  }
  disabled={
    generatingResumeId === job.id ||
    !job.analysis
  }
  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {generatingResumeId === job.id
    ? 'Génération...'
    : 'Générer le CV'}
</button>

            {job.url ? (
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-black px-5 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
              >
                Voir l&apos;offre
              </a>
            ) : (
              <span className="rounded-lg bg-gray-100 px-5 py-3 text-center text-sm text-gray-400">
                Aucun lien
              </span>
            )}
          </div>
        </div>
      </article>
    );
  })}
</div>

      {/* Aucun résultat */}
      {filteredJobs.length === 0 && (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500">
          Aucune offre trouvée.
        </div>
      )}
    </div>
  </main>
);
}

function formatSource(source: string) {
  const labels: Record<string, string> = {
    FRANCE_TRAVAIL: 'France Travail',
    ADZUNA: 'Adzuna',
    JOOBLE: 'Jooble',
    FREE_WORK: 'Free-Work',
    HELLOWORK: 'HelloWork',
    WTTJ: 'Welcome to the Jungle',
    LINKEDIN: 'LinkedIn',
    INDEED: 'Indeed',
  };

  return labels[source] ?? source;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}function cleanJobText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(
      /([a-zA-ZÀ-ÿ])\?([a-zA-ZÀ-ÿ])/g,
      "$1'$2",
    )
    .replace(/\s+/g, ' ')
    .trim();
}