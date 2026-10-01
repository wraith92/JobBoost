'use client';

import { useEffect, useMemo, useState } from 'react';

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
};

const API_URL = 'http://localhost:3001';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('ALL');

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p>Chargement des offres...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Offres d&apos;emploi
          </h1>

          <p className="mt-2 text-gray-600">
            {filteredJobs.length} offre(s) affichée(s)
            sur {jobs.length}
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row">
          <input
            type="text"
            placeholder="React, Node.js, Data, entreprise..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          <select
            value={source}
            onChange={(event) =>
              setSource(event.target.value)
            }
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
        </div>

        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                      {formatSource(job.source)}
                    </span>

                    {job.contractType && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                        {job.contractType}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    {job.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
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
                        📅{' '}
                        {formatDate(
                          job.sourceCreatedAt,
                        )}
                      </span>
                    )}

                    {job.salary && (
                      <span>
                        💰 {job.salary}
                      </span>
                    )}
                  </div>

                  {job.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                      {job.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-start">
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Voir l&apos;offre
                    </a>
                  ) : (
                    <span className="rounded-lg bg-gray-100 px-5 py-3 text-sm text-gray-400">
                      Aucun lien
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

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
}