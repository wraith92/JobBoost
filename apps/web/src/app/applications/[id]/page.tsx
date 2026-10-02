'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import Link from 'next/link';

const API_URL = 'http://localhost:3001';

type ApplicationStatus =
  | 'DRAFT'
  | 'READY_TO_VALIDATE'
  | 'SENT'
  | 'RESPONSE_RECEIVED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'FOLLOW_UP'
  | 'ARCHIVED';

type Application = {
  id: string;

  status: ApplicationStatus;

  channel: string | null;
  notes: string | null;

  appliedAt: string | null;
  followUpAt: string | null;

  createdAt: string;

  job: {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
    source: string;

    analysis: {
      score: number | null;
    } | null;
  };

  resume: {
    id: string;
    title: string;
  } | null;

  coverLetter: {
    id: string;
    title: string;
  } | null;
};

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();

  const applicationId =
    params.id as string;

  const [
    application,
    setApplication,
  ] = useState<Application | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    channel,
    setChannel,
  ] = useState('');

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    followUpAt,
    setFollowUpAt,
  ] = useState('');

  useEffect(() => {
    async function loadApplication() {
      try {
        const response =
          await fetch(
            `${API_URL}/applications/${applicationId}`,
          );

        if (!response.ok) {
          throw new Error(
            'Candidature introuvable',
          );
        }

        const data =
          (await response.json()) as Application;

        setApplication(data);

        setChannel(
          data.channel ?? '',
        );

        setNotes(
          data.notes ?? '',
        );

        setFollowUpAt(
          data.followUpAt
            ? data.followUpAt.slice(
                0,
                16,
              )
            : '',
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (applicationId) {
      void loadApplication();
    }
  }, [applicationId]);

  async function saveApplication() {
    if (!application) {
      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_URL}/applications/${application.id}`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              channel:
                channel || null,

              notes:
                notes || null,

              followUpAt:
                followUpAt || null,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await response.text(),
        );
      }

      const updated =
        (await response.json()) as Application;

      setApplication(updated);

      alert(
        'Candidature mise à jour',
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : 'Erreur pendant la sauvegarde',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        Chargement...
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        Candidature introuvable.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-5xl px-6">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Candidature
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              {application.job.title}
            </h1>

            {application.job.company && (
              <p className="mt-1 text-sm text-gray-600">
                {application.job.company}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/applications',
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
          >
            Retour
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">

            {/* INFOS */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">
                Informations
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs text-gray-500">
                    Source
                  </p>

                  <p className="font-medium">
                    {application.job.source}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Compatibilité
                  </p>

                  <p className="font-medium">
                    {application.job.analysis
                      ?.score ?? '-'}{' '}
                    %
                  </p>
                </div>

              </div>
            </section>

            {/* NOTES */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">
                Suivi
              </h2>

              <div className="mt-5 space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Canal
                  </label>

                  <select
                    value={channel}
                    onChange={(event) =>
                      setChannel(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">
                      Non renseigné
                    </option>

                    <option value="MANUAL">
                      Manuel
                    </option>

                    <option value="LINKEDIN">
                      LinkedIn
                    </option>

                    <option value="INDEED">
                      Indeed
                    </option>

                    <option value="HELLOWORK">
                      HelloWork
                    </option>

                    <option value="WTTJ">
                      Welcome to the Jungle
                    </option>

                    <option value="FREE_WORK">
                      Free-Work
                    </option>

                    <option value="EMAIL">
                      Email
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Date de relance
                  </label>

                  <input
                    type="datetime-local"
                    value={followUpAt}
                    onChange={(event) =>
                      setFollowUpAt(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Notes
                  </label>

                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value,
                      )
                    }
                    rows={7}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Contact recruteur, retour, salaire, prochaine action..."
                  />
                </div>

                <button
                  type="button"
                  onClick={saveApplication}
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving
                    ? 'Sauvegarde...'
                    : 'Sauvegarder'}
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">
                Documents
              </h2>

              <div className="mt-4 space-y-3">
                {application.resume && (
                  <Link
                    href={`/resume/${application.resume.id}`}
                    className="block rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    Voir le CV
                  </Link>
                )}

                {application.coverLetter && (
                  <Link
                    href={`/cover-letter/${application.coverLetter.id}`}
                    className="block rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    Voir la lettre
                  </Link>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900">
                État
              </h2>

              <p className="mt-3 text-sm font-semibold">
                {application.status}
              </p>

              {application.appliedAt && (
                <p className="mt-2 text-xs text-gray-500">
                  Envoyée le{' '}
                  {new Date(
                    application.appliedAt,
                  ).toLocaleDateString(
                    'fr-FR',
                  )}
                </p>
              )}
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}