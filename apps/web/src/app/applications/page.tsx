'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

const API_URL =
  'http://localhost:3001';

// ============================================================
// TYPES
// ============================================================

type ApplicationStatus =
  | 'DRAFT'
  | 'READY_TO_VALIDATE'
  | 'APPROVED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED'
  | 'RESPONSE_RECEIVED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'FOLLOW_UP'
  | 'ARCHIVED';

type ApplicationMethod =
  | 'UNKNOWN'
  | 'EMAIL'
  | 'FRANCE_TRAVAIL'
  | 'PARTNER'
  | 'EXTERNAL_SITE'
  | 'MANUAL';

type Application = {
  id: string;

  status: ApplicationStatus;

  channel: string | null;

  notes: string | null;

  appliedAt: string | null;

  followUpAt: string | null;

  createdAt: string;

  updatedAt: string;

  job: {
    id: string;

    title: string;

    company: string | null;

    location: string | null;

    source: string;

    url: string | null;

    applicationMethod:
      ApplicationMethod;

    applicationUrl:
      string | null;

    contactEmail:
      string | null;

    analysis: {
      score: number | null;
    } | null;
  };

  resume: {
    id: string;

    title: string;

    status: string;

    createdAt: string;
  } | null;

  coverLetter: {
    id: string;

    title: string;

    status: string;

    createdAt: string;
  } | null;
};

type SendApplicationResponse = {
  application?: {
    id: string;
    status: ApplicationStatus;
  };

  action:
    | 'OPEN_URL'
    | 'EMAIL_PENDING'
    | 'MANUAL';

  method: string;

  url?: string | null;

  email?: string | null;
};

// ============================================================
// LABELS
// ============================================================

const STATUS_LABELS: Record<
  ApplicationStatus,
  string
> = {
  DRAFT:
    'Brouillon',

  READY_TO_VALIDATE:
    'À valider',

  APPROVED:
    'Validée',

  SENDING:
    'En cours d’envoi',

  SENT:
    'Envoyée',

  FAILED:
    'Échec d’envoi',

  RESPONSE_RECEIVED:
    'Réponse reçue',

  INTERVIEW:
    'Entretien',

  REJECTED:
    'Refus',

  FOLLOW_UP:
    'À relancer',

  ARCHIVED:
    'Archivée',
};

const METHOD_LABELS: Record<
  ApplicationMethod,
  string
> = {
  UNKNOWN:
    'Mode inconnu',

  EMAIL:
    'Email',

  FRANCE_TRAVAIL:
    'France Travail',

  PARTNER:
    'Site partenaire',

  EXTERNAL_SITE:
    'Site externe',

  MANUAL:
    'Manuel',
};

// ============================================================
// PAGE
// ============================================================

export default function ApplicationsPage() {
  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<string | null>(
    null,
  );

  // ============================================================
  // LOAD
  // ============================================================

  const loadApplications =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/applications`,
            {
              cache: 'no-store',
            },
          );

        if (!response.ok) {
          throw new Error(
            'Impossible de charger les candidatures',
          );
        }

        const data =
          (await response.json()) as Application[];

        setApplications(
          data,
        );
      } catch (error) {
        console.error(
          error,
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  async function updateStatus(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    try {
      setUpdatingId(
        applicationId,
      );

      const response =
        await fetch(
          `${API_URL}/applications/${applicationId}/status`,
          {
            method:
              'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                status,
              }),
          },
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            'Impossible de modifier le statut',
        );
      }

      // On recharge depuis le backend
      // pour avoir appliedAt et les relations à jour.
      await loadApplications();
    } catch (error) {
      console.error(
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Erreur pendant la mise à jour',
      );
    } finally {
      setUpdatingId(
        null,
      );
    }
  }

  // ============================================================
  // VALIDER ET POSTULER
  // ============================================================

  async function sendApplication(
    application: Application,
  ) {
    const score =
      application.job.analysis
        ?.score ?? null;

    // ----------------------------------------------------------
    // Protection si score faible
    // ----------------------------------------------------------

    if (
      score !== null &&
      score < 50
    ) {
      const confirmed =
        window.confirm(
          `Cette offre a seulement ${score} % de compatibilité.\n\nVeux-tu quand même continuer vers la candidature ?`,
        );

      if (!confirmed) {
        return;
      }
    }

    // ----------------------------------------------------------
    // On ouvre l'onglet immédiatement.
    //
    // Cela évite que le navigateur bloque l'ouverture
    // après le await fetch().
    // ----------------------------------------------------------

    const popup =
      window.open(
        'about:blank',
        '_blank',
      );

    try {
      setUpdatingId(
        application.id,
      );

      if (popup) {
        popup.document.title =
          'Préparation de la candidature...';

        popup.document.body.innerHTML =
          `
            <div
              style="
                font-family: Arial, sans-serif;
                padding: 40px;
                text-align: center;
              "
            >
              <h2>JobBoost AI</h2>
              <p>Préparation de la candidature...</p>
            </div>
          `;
      }

      const response =
        await fetch(
          `${API_URL}/applications/${application.id}/send`,
          {
            method:
              'POST',
          },
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            'Impossible de préparer la candidature',
        );
      }

      const result =
        (await response.json()) as SendApplicationResponse;

      // --------------------------------------------------------
      // FRANCE TRAVAIL / PARTNER / EXTERNAL
      // --------------------------------------------------------

      if (
        result.action ===
          'OPEN_URL' &&
        result.url
      ) {
        if (popup) {
          popup.opener =
            null;

          popup.location.href =
            result.url;
        } else {
          // Popup bloquée :
          // fallback dans l'onglet actuel.
          window.location.href =
            result.url;
        }

        await loadApplications();

        return;
      }

      // --------------------------------------------------------
      // MODE MANUEL
      // Ex : Free-Work pas encore automatisé
      // --------------------------------------------------------

      if (
        result.action ===
          'MANUAL' &&
        result.url
      ) {
        if (popup) {
          popup.opener =
            null;

          popup.location.href =
            result.url;
        } else {
          window.location.href =
            result.url;
        }

        await loadApplications();

        alert(
          'La candidature doit être finalisée manuellement sur le site de l’offre.',
        );

        return;
      }

      // --------------------------------------------------------
      // EMAIL
      // --------------------------------------------------------

      if (
        result.action ===
        'EMAIL_PENDING'
      ) {
        popup?.close();

        await loadApplications();

        alert(
          `La candidature est validée.\n\nL’envoi automatique par email sera branché à l’étape n8n/Gmail.\n\nDestinataire : ${
            result.email ??
            'non renseigné'
          }`,
        );

        return;
      }

      popup?.close();

      await loadApplications();
    } catch (error) {
      popup?.close();

      console.error(
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Erreur pendant la préparation de la candidature',
      );
    } finally {
      setUpdatingId(
        null,
      );
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
        Chargement des candidatures...
      </main>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              JobBoost AI
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Candidatures
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {
                applications.length
              }{' '}
              candidature
              {applications.length >
              1
                ? 's'
                : ''}
            </p>
          </div>

          <Link
            href="/jobs"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Voir les offres
          </Link>
        </div>

        {/* EMPTY */}

        {applications.length ===
        0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Aucune candidature
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Génère un CV et une
              lettre depuis une offre
              pour commencer.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(
              (
                application,
              ) => (
                <ApplicationCard
                  key={
                    application.id
                  }
                  application={
                    application
                  }
                  updating={
                    updatingId ===
                    application.id
                  }
                  onStatusChange={
                    updateStatus
                  }
                  onSend={
                    sendApplication
                  }
                />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================
// APPLICATION CARD
// ============================================================

function ApplicationCard({
  application,
  updating,
  onStatusChange,
  onSend,
}: {
  application: Application;

  updating: boolean;

  onStatusChange: (
    applicationId: string,
    status: ApplicationStatus,
  ) => Promise<void>;

  onSend: (
    application: Application,
  ) => Promise<void>;
}) {
  const score =
    application.job.analysis
      ?.score ?? null;

  const applicationUrl =
    application.job
      .applicationUrl ??
    application.job.url;

  const statusOptions =
    getStatusOptions(
      application.status,
    );

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row">
        {/* INFOS */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={
                application.status
              }
            />

            {score !== null && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Compatibilité{' '}
                {score} %
              </span>
            )}

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {
                application.job
                  .source
              }
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {
                METHOD_LABELS[
                  application.job
                    .applicationMethod
                ]
              }
            </span>
          </div>

          {/* TITRE CLIQUABLE */}

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            <Link
              href={`/applications/${application.id}`}
              className="hover:underline"
            >
              {
                application.job
                  .title
              }
            </Link>
          </h2>

          <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-500">
            {application.job
              .company && (
              <span>
                {
                  application.job
                    .company
                }
              </span>
            )}

            {application.job
              .location && (
              <span>
                {
                  application.job
                    .location
                }
              </span>
            )}

            {application.channel && (
              <span>
                Canal :{' '}
                {
                  application.channel
                }
              </span>
            )}
          </div>

          {/* DOCUMENTS */}

          <div className="mt-5 flex flex-wrap gap-2">
            {application.resume && (
              <Link
                href={`/resume/${application.resume.id}`}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voir le CV
              </Link>
            )}

            {application.coverLetter && (
              <Link
                href={`/cover-letter/${application.coverLetter.id}`}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voir la lettre
              </Link>
            )}

            {application.status ===
              'APPROVED' &&
              applicationUrl && (
                <a
                  href={
                    applicationUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  Rouvrir le site
                </a>
              )}
          </div>

          {/* DATES */}

          <div className="mt-4 text-xs text-gray-400">
            Créée le{' '}
            {formatDate(
              application.createdAt,
            )}

            {application.appliedAt &&
              ` • Envoyée le ${formatDate(
                application.appliedAt,
              )}`}
          </div>
        </div>

        {/* ACTIONS */}

        <div className="w-full lg:w-72">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Statut
          </label>

          <select
            value={
              application.status
            }
            disabled={updating}
            onChange={(event) => {
              const nextStatus =
                event.target
                  .value as ApplicationStatus;

              // SENT doit passer uniquement
              // par "Confirmer l'envoi".
              if (
                nextStatus ===
                  'SENT' &&
                application.status !==
                  'SENT'
              ) {
                alert(
                  'Utilise le bouton « Confirmer l’envoi » après avoir réellement envoyé la candidature.',
                );

                return;
              }

              void onStatusChange(
                application.id,
                nextStatus,
              );
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-50"
          >
            {statusOptions.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {
                    STATUS_LABELS[
                      status
                    ]
                  }
                </option>
              ),
            )}
          </select>

          {updating && (
            <p className="mt-2 text-xs text-gray-500">
              Mise à jour...
            </p>
          )}

          {/* READY_TO_VALIDATE */}

          {application.status ===
            'READY_TO_VALIDATE' && (
            <>
              {score !== null &&
                score < 50 && (
                  <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
                    Compatibilité faible :{' '}
                    <strong>
                      {score} %
                    </strong>
                    . Vérifie bien le
                    CV et la lettre
                    avant de continuer.
                  </div>
                )}

              <button
                type="button"
                disabled={
                  updating
                }
                onClick={() =>
                  void onSend(
                    application,
                  )
                }
                className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
              >
                Valider et postuler
              </button>
            </>
          )}

          {/* FAILED */}

          {application.status ===
            'FAILED' && (
            <button
              type="button"
              disabled={
                updating
              }
              onClick={() =>
                void onSend(
                  application,
                )
              }
              className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Réessayer
            </button>
          )}

          {/* APPROVED */}

          {application.status ===
            'APPROVED' && (
            <>
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                Candidature validée.
                Finalise-la sur le
                site, puis confirme
                l’envoi ici.
              </div>

              <button
                type="button"
                disabled={
                  updating
                }
                onClick={() =>
                  void onStatusChange(
                    application.id,
                    'SENT',
                  )
                }
                className="mt-3 w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                Confirmer l’envoi
              </button>
            </>
          )}

          {/* SENDING */}

          {application.status ===
            'SENDING' && (
            <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
              Envoi en cours...
            </div>
          )}

          {/* SENT */}

          {application.status ===
            'SENT' && (
            <button
              type="button"
              disabled={
                updating
              }
              onClick={() =>
                void onStatusChange(
                  application.id,
                  'FOLLOW_UP',
                )
              }
              className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              À relancer
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ============================================================
// STATUTS DISPONIBLES DANS LE SELECT
// ============================================================

function getStatusOptions(
  currentStatus: ApplicationStatus,
): ApplicationStatus[] {
  const allStatuses =
    Object.keys(
      STATUS_LABELS,
    ) as ApplicationStatus[];

  // Les statuts techniques sont pilotés
  // par le workflow et non choisis manuellement.
  const workflowStatuses =
    new Set<ApplicationStatus>([
      'APPROVED',
      'SENDING',
      'FAILED',
    ]);

  return allStatuses.filter(
    (status) =>
      !workflowStatuses.has(
        status,
      ) ||
      status ===
        currentStatus,
  );
}

// ============================================================
// BADGE
// ============================================================

function StatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const classes: Record<
    ApplicationStatus,
    string
  > = {
    DRAFT:
      'bg-gray-100 text-gray-700',

    READY_TO_VALIDATE:
      'bg-yellow-100 text-yellow-800',

    APPROVED:
      'bg-blue-100 text-blue-800',

    SENDING:
      'bg-purple-100 text-purple-800',

    SENT:
      'bg-green-100 text-green-800',

    FAILED:
      'bg-red-100 text-red-800',

    RESPONSE_RECEIVED:
      'bg-purple-100 text-purple-800',

    INTERVIEW:
      'bg-emerald-100 text-emerald-800',

    REJECTED:
      'bg-red-100 text-red-800',

    FOLLOW_UP:
      'bg-orange-100 text-orange-800',

    ARCHIVED:
      'bg-gray-200 text-gray-600',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {
        STATUS_LABELS[
          status
        ]
      }
    </span>
  );
}

// ============================================================
// DATE
// ============================================================

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(
    new Date(value),
  );
}