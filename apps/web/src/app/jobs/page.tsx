'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

const API_URL = 'http://localhost:3001';

const PREPARE_TIMEOUT_MS = 180_000;

// ============================================================
// TYPES
// ============================================================

type JobAnalysis = {
  id: string;
  score: number | null;
  requiredSkills: string[];
  optionalSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  technologies: string[];
  summary: string | null;
};

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

  applicationMethod?: string | null;
  applicationUrl?: string | null;
  contactEmail?: string | null;

  sourceCreatedAt: string | null;
  createdAt: string;

  analysis: JobAnalysis | null;
};

type ExistingApplication = {
  id: string;
  jobId: string;
  status: string;

  resumeId: string | null;
  coverLetterId: string | null;
};

type PreparedApplication = {
  applicationId: string;
  status: string;

  resumeId: string | null;
  coverLetterId: string | null;
};

type PrepareResponse = {
  alreadyPrepared: boolean;
  message?: string;

  score?: number | null;

  application?: {
    id: string;
    jobId?: string;
    status: string;

    resumeId: string | null;
    coverLetterId: string | null;
  };

  applicationId?: string;
  status?: string;

  resumeId?: string | null;
  coverLetterId?: string | null;

  resume?: {
    id: string;
  } | null;

  coverLetter?: {
    id: string;
  } | null;
};

type SendResponse = {
  application?: {
    id: string;
    status: string;

    resumeId?: string | null;
    coverLetterId?: string | null;
  };

  action:
    | 'OPEN_URL'
    | 'EMAIL_PENDING'
    | 'MANUAL';

  method: string;

  url?: string | null;
  email?: string | null;
};

type PreparationStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

type PreparationStepStatus =
  | 'pending'
  | 'active'
  | 'done';

type DocumentTab =
  | 'resume'
  | 'letter';

type DocumentsModalState = {
  open: boolean;

  jobTitle: string;

  resumeId: string | null;
  coverLetterId: string | null;

  initialTab: DocumentTab;
};

type ActionFeedback = {
  type:
    | 'success'
    | 'error'
    | 'info';

  message: string;
};

// ============================================================
// PREPARATION STEPS
// ============================================================

const PREPARATION_STEPS = [
  {
    label: "Analyse de l'offre",
    description:
      'Lecture et compréhension des besoins du poste.',
  },
  {
    label: 'Matching avec ton profil',
    description:
      'Comparaison avec tes compétences et expériences.',
  },
  {
    label: 'CV personnalisé',
    description:
      'Sélection des expériences et compétences pertinentes.',
  },
  {
    label: 'Lettre de motivation',
    description:
      'Génération avec contrôle anti-hallucination.',
  },
  {
    label: 'Création de la candidature',
    description:
      'Association de l’offre, du CV et de la lettre.',
  },
];

// ============================================================
// PAGE
// ============================================================

export default function JobsPage() {
  const [
    jobs,
    setJobs,
  ] = useState<Job[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    source,
    setSource,
  ] = useState('ALL');

  const [
    analyzingJobId,
    setAnalyzingJobId,
  ] = useState<string | null>(
    null,
  );

  const [
    preparingJobId,
    setPreparingJobId,
  ] = useState<string | null>(
    null,
  );

  const [
    sendingApplicationId,
    setSendingApplicationId,
  ] = useState<string | null>(
    null,
  );

  const [
    confirmingApplicationId,
    setConfirmingApplicationId,
  ] = useState<string | null>(
    null,
  );

  const [
    preparationStatus,
    setPreparationStatus,
  ] =
    useState<PreparationStatus>(
      'idle',
    );

  const [
    preparationStep,
    setPreparationStep,
  ] = useState(0);

  const [
    preparationProgress,
    setPreparationProgress,
  ] = useState(0);

  const [
    preparationJobId,
    setPreparationJobId,
  ] = useState<string | null>(
    null,
  );

  const [
    preparationJobTitle,
    setPreparationJobTitle,
  ] = useState('');

  const [
    preparationError,
    setPreparationError,
  ] = useState('');

  const [
    preparationResult,
    setPreparationResult,
  ] =
    useState<PreparedApplication | null>(
      null,
    );

  const [
    preparationAlreadyPrepared,
    setPreparationAlreadyPrepared,
  ] = useState(false);

  const [
    preparedApplications,
    setPreparedApplications,
  ] = useState<
    Record<
      string,
      PreparedApplication
    >
  >({});

  const [
    applicationFeedback,
    setApplicationFeedback,
  ] = useState<
    Record<
      string,
      ActionFeedback
    >
  >({});

  const [
    documentsModal,
    setDocumentsModal,
  ] =
    useState<DocumentsModalState>({
      open: false,

      jobTitle: '',

      resumeId: null,

      coverLetterId: null,

      initialTab: 'resume',
    });

  const progressTimerRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    async function loadData() {
      try {
        const [
          jobsResponse,
          applicationsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/jobs`,
            {
              cache:
                'no-store',
            },
          ),

          fetch(
            `${API_URL}/applications`,
            {
              cache:
                'no-store',
            },
          ),
        ]);

        if (
          !jobsResponse.ok
        ) {
          throw new Error(
            'Erreur lors du chargement des offres.',
          );
        }

        const jobsData =
          (await jobsResponse.json()) as Job[];

        setJobs(
          jobsData,
        );

        if (
          applicationsResponse.ok
        ) {
          const applications =
            (await applicationsResponse.json()) as ExistingApplication[];

          const map: Record<
            string,
            PreparedApplication
          > = {};

          for (
            const application
            of applications
          ) {
            map[
              application.jobId
            ] = {
              applicationId:
                application.id,

              status:
                application.status,

              resumeId:
                application.resumeId,

              coverLetterId:
                application.coverLetterId,
            };
          }

          setPreparedApplications(
            map,
          );
        }
      } catch (error) {
        console.error(
          error,
        );
      } finally {
        setLoading(
          false,
        );
      }
    }

    void loadData();
  }, []);

  // ============================================================
  // TIMER CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      if (
        progressTimerRef.current
      ) {
        clearInterval(
          progressTimerRef.current,
        );
      }
    };
  }, []);

  // ============================================================
  // ANALYZE
  // ============================================================

  async function analyzeJob(
    jobId: string,
  ) {
    if (
      analyzingJobId ||
      preparingJobId
    ) {
      return;
    }

    try {
      setAnalyzingJobId(
        jobId,
      );

      const response =
        await fetch(
          `${API_URL}/llm/jobs/${jobId}/analyze`,
          {
            method:
              'POST',
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            "Erreur pendant l'analyse IA.",
          ),
        );
      }

      const result =
        await response.json();

      setJobs(
        (currentJobs) =>
          currentJobs.map(
            (job) =>
              job.id ===
              jobId
                ? {
                    ...job,

                    analysis:
                      result.analysis,
                  }
                : job,
          ),
      );
    } catch (error) {
      console.error(
        error,
      );
    } finally {
      setAnalyzingJobId(
        null,
      );
    }
  }

  // ============================================================
  // VISUAL PROGRESS
  // ============================================================

  function startVisualProgress() {
    setPreparationStep(
      0,
    );

    setPreparationProgress(
      6,
    );

    if (
      progressTimerRef.current
    ) {
      clearInterval(
        progressTimerRef.current,
      );
    }

    progressTimerRef.current =
      setInterval(() => {
        setPreparationProgress(
          (currentProgress) => {
            if (
              currentProgress >=
              92
            ) {
              return 92;
            }

            const increment =
              Math.floor(
                Math.random() *
                  6,
              ) + 2;

            const nextProgress =
              Math.min(
                currentProgress +
                  increment,
                92,
              );

            let nextStep =
              0;

            if (
              nextProgress >=
              20
            ) {
              nextStep =
                1;
            }

            if (
              nextProgress >=
              40
            ) {
              nextStep =
                2;
            }

            if (
              nextProgress >=
              62
            ) {
              nextStep =
                3;
            }

            if (
              nextProgress >=
              82
            ) {
              nextStep =
                4;
            }

            setPreparationStep(
              nextStep,
            );

            return nextProgress;
          },
        );
      }, 900);
  }

  function stopVisualProgress() {
    if (
      progressTimerRef.current
    ) {
      clearInterval(
        progressTimerRef.current,
      );

      progressTimerRef.current =
        null;
    }
  }

  // ============================================================
  // PREPARE APPLICATION
  // ============================================================

  async function prepareApplication(
    job: Job,
  ) {
    if (
      preparingJobId ||
      analyzingJobId
    ) {
      return;
    }

    // ==========================================================
    // IMPORTANT :
    // Si la candidature existe déjà,
    // on NE RELANCE PAS Ollama / CV / lettre / création.
    // ==========================================================

    const existing =
      preparedApplications[
        job.id
      ];

    if (existing) {
      stopVisualProgress();

      setPreparationJobId(
        job.id,
      );

      setPreparationJobTitle(
        job.title,
      );

      setPreparationResult(
        existing,
      );

      setPreparationAlreadyPrepared(
        true,
      );

      setPreparationProgress(
        100,
      );

      setPreparationStep(
        PREPARATION_STEPS.length,
      );

      setPreparationError(
        '',
      );

      setPreparationStatus(
        'success',
      );

      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        () => {
          controller.abort();
        },
        PREPARE_TIMEOUT_MS,
      );

    try {
      setPreparingJobId(
        job.id,
      );

      setPreparationJobId(
        job.id,
      );

      setPreparationJobTitle(
        job.title,
      );

      setPreparationStatus(
        'loading',
      );

      setPreparationError(
        '',
      );

      setPreparationResult(
        null,
      );

      setPreparationAlreadyPrepared(
        false,
      );

      startVisualProgress();

      const response =
        await fetch(
          `${API_URL}/applications/jobs/${job.id}/prepare`,
          {
            method:
              'POST',

            signal:
              controller.signal,
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de préparer la candidature.',
          ),
        );
      }

      const result =
        (await response.json()) as PrepareResponse;

      const prepared =
        normalizePrepareResponse(
          result,
        );

      stopVisualProgress();

      setPreparationProgress(
        100,
      );

      setPreparationStep(
        PREPARATION_STEPS.length,
      );

      setPreparedApplications(
        (current) => ({
          ...current,

          [job.id]:
            prepared,
        }),
      );

      setPreparationResult(
        prepared,
      );

      setPreparationAlreadyPrepared(
        result.alreadyPrepared,
      );

      setPreparationStatus(
        'success',
      );

      // Recharge les offres pour récupérer
      // applicationMethod / applicationUrl actualisés.
      try {
        const jobsResponse =
          await fetch(
            `${API_URL}/jobs`,
            {
              cache:
                'no-store',
            },
          );

        if (
          jobsResponse.ok
        ) {
          const freshJobs =
            (await jobsResponse.json()) as Job[];

          setJobs(
            freshJobs,
          );
        }
      } catch (
        refreshError
      ) {
        console.error(
          refreshError,
        );
      }
    } catch (error) {
      stopVisualProgress();

      console.error(
        error,
      );

      setPreparationStatus(
        'error',
      );

      if (
        error instanceof
          DOMException &&
        error.name ===
          'AbortError'
      ) {
        setPreparationError(
          'La préparation a dépassé le temps maximum. Vérifie le backend/Ollama puis réessaie.',
        );
      } else {
        setPreparationError(
          error instanceof
            Error
            ? error.message
            : 'Une erreur est survenue pendant la préparation.',
        );
      }
    } finally {
      window.clearTimeout(
        timeout,
      );

      setPreparingJobId(
        null,
      );
    }
  }

  // ============================================================
  // DIRECT POSTULATION
  // ============================================================

  async function sendApplication(
    prepared:
      PreparedApplication,
  ) {
    if (
      sendingApplicationId
    ) {
      return;
    }

    // On ouvre tout de suite un onglet vide
    // pour éviter le blocage popup du navigateur.
    const popup =
      window.open(
        'about:blank',
        '_blank',
      );

    if (popup) {
      try {
        popup.opener =
          null;

        popup.document.title =
          'JobBoost - ouverture de la candidature';
      } catch {
        // Rien
      }
    }

    try {
      setSendingApplicationId(
        prepared.applicationId,
      );

      setApplicationFeedback(
        (current) => ({
          ...current,

          [prepared.applicationId]:
            {
              type:
                'info',

              message:
                'Validation de la candidature...',
            },
        }),
      );

      const response =
        await fetch(
          `${API_URL}/applications/${prepared.applicationId}/send`,
          {
            method:
              'POST',
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de lancer la candidature.',
          ),
        );
      }

      const result =
        (await response.json()) as SendResponse;

      const newStatus =
        result.application
          ?.status ??
        'APPROVED';

      updateApplicationStatusLocally(
        prepared.applicationId,
        newStatus,
      );

      if (
        result.action ===
          'OPEN_URL' &&
        result.url
      ) {
        if (popup) {
          popup.location.href =
            result.url;
        } else {
          window.open(
            result.url,
            '_blank',
          );
        }

        setApplicationFeedback(
          (current) => ({
            ...current,

            [prepared.applicationId]:
              {
                type:
                  'success',

                message:
                  'Le site de candidature a été ouvert. Termine la candidature puis reviens ici pour confirmer l’envoi.',
              },
          }),
        );

        return;
      }

      if (
        popup &&
        !popup.closed
      ) {
        popup.close();
      }

      if (
        result.action ===
        'EMAIL_PENDING'
      ) {
        setApplicationFeedback(
          (current) => ({
            ...current,

            [prepared.applicationId]:
              {
                type:
                  'info',

                message:
                  result.email
                    ? `Candidature email détectée pour ${result.email}. L’envoi automatique sera branché à l’étape email.`
                    : 'Candidature email détectée. L’envoi automatique sera branché à l’étape email.',
              },
          }),
        );

        return;
      }

      if (
        result.action ===
        'MANUAL'
      ) {
        if (
          result.url
        ) {
          window.open(
            result.url,
            '_blank',
          );
        }

        setApplicationFeedback(
          (current) => ({
            ...current,

            [prepared.applicationId]:
              {
                type:
                  'info',

                message:
                  'Cette candidature nécessite une action manuelle.',
              },
          }),
        );
      }
    } catch (error) {
      if (
        popup &&
        !popup.closed
      ) {
        popup.close();
      }

      console.error(
        error,
      );

      setApplicationFeedback(
        (current) => ({
          ...current,

          [prepared.applicationId]:
            {
              type:
                'error',

              message:
                error instanceof
                  Error
                  ? error.message
                  : 'Impossible de lancer la candidature.',
            },
        }),
      );
    } finally {
      setSendingApplicationId(
        null,
      );
    }
  }

  // ============================================================
  // CONFIRM APPLICATION SENT
  // ============================================================

  async function confirmApplicationSent(
    prepared:
      PreparedApplication,
  ) {
    if (
      confirmingApplicationId
    ) {
      return;
    }

    try {
      setConfirmingApplicationId(
        prepared.applicationId,
      );

      const response =
        await fetch(
          `${API_URL}/applications/${prepared.applicationId}/status`,
          {
            method:
              'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                status:
                  'SENT',
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de confirmer l’envoi.',
          ),
        );
      }

      updateApplicationStatusLocally(
        prepared.applicationId,
        'SENT',
      );

      setApplicationFeedback(
        (current) => ({
          ...current,

          [prepared.applicationId]:
            {
              type:
                'success',

              message:
                'Candidature enregistrée comme envoyée.',
            },
        }),
      );
    } catch (error) {
      console.error(
        error,
      );

      setApplicationFeedback(
        (current) => ({
          ...current,

          [prepared.applicationId]:
            {
              type:
                'error',

              message:
                error instanceof
                  Error
                  ? error.message
                  : 'Impossible de confirmer l’envoi.',
            },
        }),
      );
    } finally {
      setConfirmingApplicationId(
        null,
      );
    }
  }

  // ============================================================
  // LOCAL APPLICATION UPDATE
  // ============================================================

  function updateApplicationStatusLocally(
    applicationId: string,
    status: string,
  ) {
    setPreparedApplications(
      (current) => {
        const next = {
          ...current,
        };

        for (
          const [
            jobId,
            application,
          ]
          of Object.entries(
            next,
          )
        ) {
          if (
            application.applicationId ===
            applicationId
          ) {
            next[jobId] = {
              ...application,
              status,
            };
          }
        }

        return next;
      },
    );

    setPreparationResult(
      (current) =>
        current &&
        current.applicationId ===
          applicationId
          ? {
              ...current,
              status,
            }
          : current,
    );
  }

  // ============================================================
  // REOPEN EXTERNAL SITE
  // ============================================================

  function reopenApplicationSite(
    job: Job,
  ) {
    const url =
      job.applicationUrl ??
      job.url;

    if (!url) {
      return;
    }

    window.open(
      url,
      '_blank',
    );
  }

  // ============================================================
  // PREPARATION MODAL
  // ============================================================

  function closePreparationModal() {
    stopVisualProgress();

    setPreparationStatus(
      'idle',
    );

    setPreparationStep(
      0,
    );

    setPreparationProgress(
      0,
    );

    setPreparationJobId(
      null,
    );

    setPreparationJobTitle(
      '',
    );

    setPreparationError(
      '',
    );

    setPreparationResult(
      null,
    );

    setPreparationAlreadyPrepared(
      false,
    );
  }

  // ============================================================
  // DOCUMENTS
  // ============================================================

  function openDocuments(
    jobTitle: string,

    prepared:
      PreparedApplication,

    initialTab:
      DocumentTab =
        'resume',
  ) {
    setDocumentsModal({
      open: true,

      jobTitle,

      resumeId:
        prepared.resumeId,

      coverLetterId:
        prepared.coverLetterId,

      initialTab,
    });
  }

  function closeDocuments() {
    setDocumentsModal(
      (current) => ({
        ...current,

        open:
          false,
      }),
    );
  }

  // ============================================================
  // SOURCES
  // ============================================================

  const sources =
    useMemo(() => {
      return Array.from(
        new Set(
          jobs.map(
            (job) =>
              job.source,
          ),
        ),
      ).sort();
    }, [jobs]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredJobs =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return jobs.filter(
        (job) => {
          const text = [
            job.title,
            job.company,
            job.location,
            job.description,

            job.source,
            job.externalId,

            job.applicationMethod,
            job.applicationUrl,
            job.contactEmail,
            job.url,
          ]
            .filter(
              Boolean,
            )
            .join(' ')
            .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            text.includes(
              normalizedSearch,
            );

          const matchesSource =
            source ===
              'ALL' ||
            job.source ===
              source;

          return (
            matchesSearch &&
            matchesSource
          );
        },
      );
    }, [
      jobs,
      search,
      source,
    ]);

  const preparationJob =
    preparationJobId
      ? jobs.find(
          (job) =>
            job.id ===
            preparationJobId,
        ) ??
        null
      : null;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <MainSpinner />

          <p className="mt-4 text-sm font-semibold text-gray-900">
            Chargement des
            offres...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            JobBoost AI
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ======================================================
          PREPARATION POPUP
         ====================================================== */}

      {preparationStatus !==
        'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-7 py-6">
              {preparationStatus ===
                'loading' && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-white">
                      <MainSpinnerLight />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                        JobBoost AI
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-gray-950">
                        Préparation
                        de ta
                        candidature
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 truncate rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                    {
                      preparationJobTitle
                    }
                  </p>
                </>
              )}

              {preparationStatus ===
                'success' && (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckIcon className="h-8 w-8 text-emerald-700" />
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-gray-950">
                    {preparationAlreadyPrepared
                      ? 'Candidature déjà préparée'
                      : 'Candidature prête'}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {preparationAlreadyPrepared
                      ? 'On réutilise les documents déjà créés. Aucun nouveau CV ou lettre n’a été généré.'
                      : 'Le CV et la lettre ont été personnalisés pour cette offre.'}
                  </p>
                </div>
              )}

              {preparationStatus ===
                'error' && (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <span className="text-2xl font-bold text-red-700">
                      !
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-gray-950">
                    Préparation
                    interrompue
                  </h2>
                </div>
              )}
            </div>

            {/* LOADING */}

            {preparationStatus ===
              'loading' && (
              <div className="px-7 py-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Progression
                  </span>

                  <span className="text-xs font-bold text-gray-900">
                    {
                      preparationProgress
                    }
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-950 transition-all duration-700"
                    style={{
                      width:
                        `${preparationProgress}%`,
                    }}
                  />
                </div>

                <div className="mt-7 space-y-1">
                  {PREPARATION_STEPS.map(
                    (
                      step,
                      index,
                    ) => (
                      <PreparationStep
                        key={
                          step.label
                        }
                        label={
                          step.label
                        }
                        description={
                          step.description
                        }
                        status={getStepStatus(
                          index,
                          preparationStep,
                        )}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            {/* SUCCESS */}

            {preparationStatus ===
              'success' &&
              preparationResult && (
                <div className="px-7 py-6">
                  <div className="space-y-3">
                    <SuccessRow
                      label="Analyse et matching"
                      value="Terminé"
                    />

                    <SuccessRow
                      label="CV personnalisé"
                      value="Prêt"
                    />

                    <SuccessRow
                      label="Lettre de motivation"
                      value="Prête"
                    />

                    <SuccessRow
                      label="Candidature"
                      value={formatApplicationStatus(
                        preparationResult.status,
                      )}
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-950">
                      Vérifier les
                      documents
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Consulte les
                      documents avant
                      de lancer la
                      candidature.
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={
                          !preparationResult.resumeId
                        }
                        onClick={() =>
                          openDocuments(
                            preparationJobTitle,
                            preparationResult,
                            'resume',
                          )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Voir le CV
                      </button>

                      <button
                        type="button"
                        disabled={
                          !preparationResult.coverLetterId
                        }
                        onClick={() =>
                          openDocuments(
                            preparationJobTitle,
                            preparationResult,
                            'letter',
                          )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Voir la lettre
                      </button>
                    </div>
                  </div>

                  {applicationFeedback[
                    preparationResult.applicationId
                  ] && (
                    <FeedbackBox
                      feedback={
                        applicationFeedback[
                          preparationResult.applicationId
                        ]
                      }
                    />
                  )}

                  <div className="mt-5 space-y-2">
                    {(preparationResult.status ===
                      'READY_TO_VALIDATE' ||
                      preparationResult.status ===
                        'FAILED') && (
                      <button
                        type="button"
                        disabled={
                          sendingApplicationId ===
                          preparationResult.applicationId
                        }
                        onClick={() =>
                          void sendApplication(
                            preparationResult,
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {sendingApplicationId ===
                          preparationResult.applicationId && (
                          <SmallSpinner />
                        )}

                        {sendingApplicationId ===
                        preparationResult.applicationId
                          ? 'Ouverture...'
                          : 'Valider et postuler'}
                      </button>
                    )}

                    {preparationResult.status ===
                      'APPROVED' && (
                      <>
                        <button
                          type="button"
                          disabled={
                            confirmingApplicationId ===
                            preparationResult.applicationId
                          }
                          onClick={() =>
                            void confirmApplicationSent(
                              preparationResult,
                            )
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {confirmingApplicationId ===
                            preparationResult.applicationId && (
                            <SmallSpinner />
                          )}

                          Confirmer que
                          j&apos;ai
                          postulé
                        </button>

                        {preparationJob &&
                          (preparationJob.applicationUrl ||
                            preparationJob.url) && (
                            <button
                              type="button"
                              onClick={() =>
                                reopenApplicationSite(
                                  preparationJob,
                                )
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Rouvrir le
                              site de
                              candidature
                            </button>
                          )}
                      </>
                    )}

                    {preparationResult.status ===
                      'SENT' && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
                        ✓ Candidature
                        envoyée
                      </div>
                    )}

                    <Link
                      href={`/applications/${preparationResult.applicationId}`}
                      className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Voir le suivi
                    </Link>

                    <button
                      type="button"
                      onClick={
                        closePreparationModal
                      }
                      className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}

            {/* ERROR */}

            {preparationStatus ===
              'error' && (
              <div className="px-7 py-6">
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm leading-6 text-red-800">
                    {
                      preparationError
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closePreparationModal
                  }
                  className="mt-5 w-full rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          DOCUMENT POPUP
         ====================================================== */}

      <ApplicationDocumentsModal
        open={
          documentsModal.open
        }
        jobTitle={
          documentsModal.jobTitle
        }
        resumeId={
          documentsModal.resumeId
        }
        coverLetterId={
          documentsModal.coverLetterId
        }
        initialTab={
          documentsModal.initialTab
        }
        onClose={
          closeDocuments
        }
      />

      {/* ======================================================
          PAGE
         ====================================================== */}

      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          {/* HEADER */}

          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-gray-400">
                JobBoost AI
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-950">
                Offres
                d&apos;emploi
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {
                  filteredJobs.length
                }{' '}
                offre(s)
                affichée(s) sur{' '}
                {jobs.length}
              </p>
            </div>

            <Link
              href="/applications"
              className="rounded-xl bg-gray-950 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Mes candidatures
            </Link>
          </div>

          {/* FILTERS */}

          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
            <input
              type="text"
              placeholder="React, Taleez, 214THRT, France Travail, entreprise..."
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-950"
            />

            <select
              value={
                source
              }
              onChange={(
                event,
              ) =>
                setSource(
                  event.target.value,
                )
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
            >
              <option value="ALL">
                Toutes les
                sources
              </option>

              {sources.map(
                (item) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {formatSource(
                      item,
                    )}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* JOB LIST */}

          <div className="space-y-5">
            {filteredJobs.map(
              (job) => {
                const prepared =
                  preparedApplications[
                    job.id
                  ];

                const isAnalyzing =
                  analyzingJobId ===
                  job.id;

                const isPreparing =
                  preparingJobId ===
                  job.id;

                const feedback =
                  prepared
                    ? applicationFeedback[
                        prepared.applicationId
                      ]
                    : null;

                return (
                  <article
                    key={
                      job.id
                    }
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-6 md:flex-row">
                      <div className="min-w-0 flex-1">
                        {/* BADGES */}

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-semibold text-white">
                            {formatSource(
                              job.source,
                            )}
                          </span>

                          {job.contractType && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                              {
                                job.contractType
                              }
                            </span>
                          )}

                          {job.analysis && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              IA analysée
                            </span>
                          )}

                          {job.applicationMethod && (
                            <ApplicationMethodBadge
                              method={
                                job.applicationMethod
                              }
                            />
                          )}

                          {prepared && (
                            <ApplicationStatusBadge
                              status={
                                prepared.status
                              }
                            />
                          )}
                        </div>

                        {/* TITLE */}

                        <h2 className="text-xl font-bold text-gray-950">
                          {
                            job.title
                          }
                        </h2>

                        <p className="mt-1 text-xs text-gray-400">
                          Référence :{' '}
                          {
                            job.externalId
                          }
                        </p>

                        {/* SCORE */}

                        {job.analysis && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700">
                              Compatibilité

                              <strong className="text-gray-950">
                                {job
                                  .analysis
                                  .score ??
                                  0}
                                %
                              </strong>
                            </span>
                          </div>
                        )}

                        {/* INFOS */}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                          {job.company && (
                            <span>
                              🏢{' '}
                              {
                                job.company
                              }
                            </span>
                          )}

                          {job.location && (
                            <span>
                              📍{' '}
                              {
                                job.location
                              }
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
                              💰{' '}
                              {
                                job.salary
                              }
                            </span>
                          )}
                        </div>

                        {/* DESCRIPTION */}

                        {job.description && (
                          <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                            {
                              job.description
                            }
                          </p>
                        )}

                        {/* SUMMARY */}

                        {job.analysis
                          ?.summary && (
                          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="mb-1 text-sm font-bold text-gray-900">
                              Résumé IA
                            </p>

                            <p className="text-sm leading-6 text-gray-600">
                              {
                                job
                                  .analysis
                                  .summary
                              }
                            </p>
                          </div>
                        )}

                        {/* SKILLS */}

                        {job.analysis &&
                          job.analysis
                            .requiredSkills
                            .length >
                            0 && (
                            <SkillsBlock
                              title="Compétences demandées"
                              skills={
                                job
                                  .analysis
                                  .requiredSkills
                              }
                              variant="neutral"
                            />
                          )}

                        {job.analysis &&
                          job.analysis
                            .matchedSkills
                            .length >
                            0 && (
                            <SkillsBlock
                              title="Compétences correspondantes"
                              skills={
                                job
                                  .analysis
                                  .matchedSkills
                              }
                              variant="success"
                            />
                          )}

                        {job.analysis &&
                          job.analysis
                            .missingSkills
                            .length >
                            0 && (
                            <SkillsBlock
                              title="Compétences manquantes"
                              skills={
                                job
                                  .analysis
                                  .missingSkills
                              }
                              variant="danger"
                            />
                          )}

                        {job.analysis &&
                          job.analysis
                            .technologies
                            .length >
                            0 && (
                            <SkillsBlock
                              title="Technologies détectées"
                              skills={
                                job
                                  .analysis
                                  .technologies
                              }
                              variant="technology"
                            />
                          )}

                        {/* PREPARED */}

                        {prepared && (
                          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
                            <div className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                                  <CheckIcon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-gray-950">
                                      Candidature
                                      préparée
                                    </h3>

                                    <ApplicationStatusBadge
                                      status={
                                        prepared.status
                                      }
                                    />
                                  </div>

                                  <p className="mt-2 text-sm leading-6 text-gray-600">
                                    CV et lettre
                                    prêts. Tu peux
                                    vérifier les
                                    documents puis
                                    postuler
                                    directement.
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <DocumentReadyCard
                                  title="CV personnalisé"
                                  available={Boolean(
                                    prepared.resumeId,
                                  )}
                                />

                                <DocumentReadyCard
                                  title="Lettre de motivation"
                                  available={Boolean(
                                    prepared.coverLetterId,
                                  )}
                                />
                              </div>

                              {feedback && (
                                <FeedbackBox
                                  feedback={
                                    feedback
                                  }
                                />
                              )}

                              <div className="mt-5 grid gap-2 md:grid-cols-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDocuments(
                                      job.title,
                                      prepared,
                                      'resume',
                                    )
                                  }
                                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  <EyeIcon />

                                  Aperçu CV &
                                  lettre
                                </button>

                                {(prepared.status ===
                                  'READY_TO_VALIDATE' ||
                                  prepared.status ===
                                    'FAILED') && (
                                  <button
                                    type="button"
                                    disabled={
                                      sendingApplicationId ===
                                      prepared.applicationId
                                    }
                                    onClick={() =>
                                      void sendApplication(
                                        prepared,
                                      )
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {sendingApplicationId ===
                                      prepared.applicationId && (
                                      <SmallSpinner />
                                    )}

                                    {sendingApplicationId ===
                                    prepared.applicationId
                                      ? 'Ouverture...'
                                      : 'Valider et postuler'}
                                  </button>
                                )}

                                {prepared.status ===
                                  'APPROVED' && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={
                                        confirmingApplicationId ===
                                        prepared.applicationId
                                      }
                                      onClick={() =>
                                        void confirmApplicationSent(
                                          prepared,
                                        )
                                      }
                                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                      {confirmingApplicationId ===
                                        prepared.applicationId && (
                                        <SmallSpinner />
                                      )}

                                      Confirmer que
                                      j&apos;ai
                                      postulé
                                    </button>

                                    {(job.applicationUrl ||
                                      job.url) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          reopenApplicationSite(
                                            job,
                                          )
                                        }
                                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                      >
                                        Rouvrir le
                                        site
                                      </button>
                                    )}
                                  </>
                                )}

                                {prepared.status ===
                                  'SENT' && (
                                  <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
                                    ✓ Candidature
                                    envoyée
                                  </div>
                                )}

                                <Link
                                  href={`/applications/${prepared.applicationId}`}
                                  className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  Voir le suivi
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 flex-col gap-2 md:w-56">
                        <button
                          type="button"
                          disabled={
                            isAnalyzing ||
                            isPreparing ||
                            preparingJobId !==
                              null
                          }
                          onClick={() =>
                            void analyzeJob(
                              job.id,
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {isAnalyzing && (
                            <SmallSpinner />
                          )}

                          {isAnalyzing
                            ? 'Analyse en cours...'
                            : job.analysis
                              ? 'Ré-analyser avec IA'
                              : 'Analyser avec IA'}
                        </button>

                        {!prepared ? (
                          <button
                            type="button"
                            disabled={
                              isPreparing ||
                              analyzingJobId !==
                                null ||
                              preparingJobId !==
                                null
                            }
                            onClick={() =>
                              void prepareApplication(
                                job,
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isPreparing && (
                              <SmallSpinner />
                            )}

                            {isPreparing
                              ? 'Préparation...'
                              : 'Préparer la candidature'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              prepareApplication(
                                job,
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            <CheckIcon />

                            Candidature
                            prête
                          </button>
                        )}

                        {job.url ? (
                          <a
                            href={
                              job.url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-gray-950 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
                          >
                            Voir
                            l&apos;offre
                          </a>
                        ) : (
                          <span className="rounded-xl bg-gray-100 px-5 py-3 text-center text-sm text-gray-400">
                            Aucun lien
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>

          {filteredJobs.length ===
            0 && (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
              Aucune offre
              trouvée.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ============================================================
// NORMALIZE PREPARE RESPONSE
// ============================================================

function normalizePrepareResponse(
  result:
    PrepareResponse,
): PreparedApplication {
  if (
    result.application
  ) {
    return {
      applicationId:
        result.application.id,

      status:
        result.application.status,

      resumeId:
        result.application.resumeId,

      coverLetterId:
        result.application.coverLetterId,
    };
  }

  if (
    !result.applicationId
  ) {
    throw new Error(
      "L'API n'a pas retourné l'identifiant de la candidature.",
    );
  }

  return {
    applicationId:
      result.applicationId,

    status:
      result.status ??
      'READY_TO_VALIDATE',

    resumeId:
      result.resumeId ??
      result.resume?.id ??
      null,

    coverLetterId:
      result.coverLetterId ??
      result.coverLetter
        ?.id ??
      null,
  };
}

// ============================================================
// DOCUMENT MODAL
// ============================================================

function ApplicationDocumentsModal({
  open,
  jobTitle,
  resumeId,
  coverLetterId,
  initialTab,
  onClose,
}: {
  open: boolean;

  jobTitle: string;

  resumeId:
    | string
    | null;

  coverLetterId:
    | string
    | null;

  initialTab:
    DocumentTab;

  onClose: () => void;
}) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<DocumentTab>(
      initialTab,
    );

  const [
    loadingDocument,
    setLoadingDocument,
  ] = useState(false);

  const [
    documentError,
    setDocumentError,
  ] = useState('');

  const [
    resumeBlobUrl,
    setResumeBlobUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    letterBlobUrl,
    setLetterBlobUrl,
  ] =
    useState<string | null>(
      null,
    );

  // ============================================================
  // RESET TAB
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    let tab =
      initialTab;

    if (
      tab ===
        'resume' &&
      !resumeId &&
      coverLetterId
    ) {
      tab =
        'letter';
    }

    if (
      tab ===
        'letter' &&
      !coverLetterId &&
      resumeId
    ) {
      tab =
        'resume';
    }

    setActiveTab(
      tab,
    );

    setDocumentError(
      '',
    );
  }, [
    open,
    initialTab,
    resumeId,
    coverLetterId,
  ]);

  // ============================================================
  // LOAD PDF BLOB
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller =
      new AbortController();

    async function loadDocument() {
      try {
        setLoadingDocument(
          true,
        );

        setDocumentError(
          '',
        );

        const id =
          activeTab ===
          'resume'
            ? resumeId
            : coverLetterId;

        if (!id) {
          throw new Error(
            'Document indisponible.',
          );
        }

        if (
          activeTab ===
            'resume' &&
          resumeBlobUrl
        ) {
          return;
        }

        if (
          activeTab ===
            'letter' &&
          letterBlobUrl
        ) {
          return;
        }

        const endpoint =
          activeTab ===
          'resume'
            ? `${API_URL}/resume/${id}/pdf`
            : `${API_URL}/cover-letter/${id}/pdf`;

        const response =
          await fetch(
            endpoint,
            {
              method:
                'GET',

              cache:
                'no-store',

              signal:
                controller.signal,
            },
          );

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              'Impossible de charger le document.',
            ),
          );
        }

        const originalBlob =
          await response.blob();

        if (
          !originalBlob.size
        ) {
          throw new Error(
            'Le document PDF est vide.',
          );
        }

        const pdfBlob =
          new Blob(
            [
              originalBlob,
            ],
            {
              type:
                'application/pdf',
            },
          );

        const objectUrl =
          URL.createObjectURL(
            pdfBlob,
          );

        if (
          activeTab ===
          'resume'
        ) {
          setResumeBlobUrl(
            objectUrl,
          );
        } else {
          setLetterBlobUrl(
            objectUrl,
          );
        }
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          error,
        );

        setDocumentError(
          error instanceof
            Error
            ? error.message
            : 'Impossible de charger le document.',
        );
      } finally {
        setLoadingDocument(
          false,
        );
      }
    }

    void loadDocument();

    return () => {
      controller.abort();
    };
  }, [
    open,
    activeTab,
    resumeId,
    coverLetterId,
    resumeBlobUrl,
    letterBlobUrl,
  ]);

  // ============================================================
  // CLEAN BLOBS
  // ============================================================

  useEffect(() => {
    if (open) {
      return;
    }

    if (
      resumeBlobUrl
    ) {
      URL.revokeObjectURL(
        resumeBlobUrl,
      );

      setResumeBlobUrl(
        null,
      );
    }

    if (
      letterBlobUrl
    ) {
      URL.revokeObjectURL(
        letterBlobUrl,
      );

      setLetterBlobUrl(
        null,
      );
    }
  }, [
    open,
    resumeBlobUrl,
    letterBlobUrl,
  ]);

  // ============================================================
  // ESCAPE
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    function handleKeyDown(
      event:
        KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose();
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        oldOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);

  // ============================================================
  // DOWNLOAD
  // ============================================================

  async function downloadDocument(
    type:
      DocumentTab,
  ) {
    try {
      const id =
        type ===
        'resume'
          ? resumeId
          : coverLetterId;

      if (!id) {
        return;
      }

      const endpoint =
        type ===
        'resume'
          ? `${API_URL}/resume/${id}/pdf`
          : `${API_URL}/cover-letter/${id}/pdf`;

      const response =
        await fetch(
          endpoint,
          {
            method:
              'GET',

            cache:
              'no-store',
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de télécharger le document.',
          ),
        );
      }

      const originalBlob =
        await response.blob();

      const pdfBlob =
        new Blob(
          [
            originalBlob,
          ],
          {
            type:
              'application/pdf',
          },
        );

      const url =
        URL.createObjectURL(
          pdfBlob,
        );

      const safeTitle =
        jobTitle
          .normalize(
            'NFD',
          )
          .replace(
            /[\u0300-\u036f]/g,
            '',
          )
          .replace(
            /[^a-zA-Z0-9-_ ]/g,
            '',
          )
          .trim()
          .replace(
            /\s+/g,
            '_',
          )
          .slice(
            0,
            55,
          );

      const fileName =
        type ===
        'resume'
          ? `CV_Abderrahmane_Ben_Salah_${safeTitle}.pdf`
          : `Lettre_Motivation_Abderrahmane_Ben_Salah_${safeTitle}.pdf`;

      const link =
        document.createElement(
          'a',
        );

      link.href =
        url;

      link.download =
        fileName;

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            url,
          );
        },
        1000,
      );
    } catch (error) {
      console.error(
        error,
      );

      setDocumentError(
        error instanceof
          Error
          ? error.message
          : 'Impossible de télécharger le document.',
      );
    }
  }

  if (!open) {
    return null;
  }

  const currentDocumentUrl =
    activeTab ===
    'resume'
      ? resumeBlobUrl
      : letterBlobUrl;

  function selectTab(
    tab:
      DocumentTab,
  ) {
    if (
      tab ===
      activeTab
    ) {
      return;
    }

    setDocumentError(
      '',
    );

    setActiveTab(
      tab,
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/75 p-3 backdrop-blur-sm md:p-6"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        {/* HEADER */}

        <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-4 md:px-7">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
                  <DocumentIcon />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                    JobBoost AI
                  </p>

                  <h2 className="text-lg font-bold text-gray-950 md:text-xl">
                    Aperçu de la
                    candidature
                  </h2>
                </div>
              </div>

              <p className="mt-3 truncate text-sm font-medium text-gray-500">
                {jobTitle}
              </p>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-2xl text-gray-400 hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {/* TABS */}

          <div className="mt-5 flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              disabled={
                !resumeId
              }
              onClick={() =>
                selectTab(
                  'resume',
                )
              }
              className={[
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition',

                activeTab ===
                'resume'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',

                !resumeId
                  ? 'cursor-not-allowed opacity-40'
                  : '',
              ].join(' ')}
            >
              <DocumentIcon />

              CV personnalisé
            </button>

            <button
              type="button"
              disabled={
                !coverLetterId
              }
              onClick={() =>
                selectTab(
                  'letter',
                )
              }
              className={[
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition',

                activeTab ===
                'letter'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',

                !coverLetterId
                  ? 'cursor-not-allowed opacity-40'
                  : '',
              ].join(' ')}
            >
              <DocumentIcon />

              Lettre de
              motivation
            </button>
          </div>
        </div>

        {/* PDF */}

        <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-200">
          {loadingDocument && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100">
              <div className="rounded-2xl border border-gray-200 bg-white px-10 py-8 text-center shadow-sm">
                <MainSpinner />

                <p className="mt-4 text-sm font-bold text-gray-900">
                  {activeTab ===
                  'resume'
                    ? 'Chargement du CV...'
                    : 'Chargement de la lettre...'}
                </p>
              </div>
            </div>
          )}

          {!loadingDocument &&
            documentError && (
              <div className="flex h-full items-center justify-center p-6">
                <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center">
                  <p className="font-bold text-red-700">
                    {
                      documentError
                    }
                  </p>
                </div>
              </div>
            )}

          {!loadingDocument &&
            !documentError &&
            currentDocumentUrl && (
              <iframe
                key={
                  currentDocumentUrl
                }
                src={`${currentDocumentUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                title={
                  activeTab ===
                  'resume'
                    ? 'CV personnalisé'
                    : 'Lettre de motivation'
                }
                className="h-full w-full border-0 bg-gray-200"
              />
            )}
        </div>

        {/* FOOTER */}

        <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 md:px-7">
          <div className="flex flex-wrap justify-end gap-2">
            {resumeId && (
              <button
                type="button"
                onClick={() =>
                  void downloadDocument(
                    'resume',
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <DownloadIcon />

                Télécharger
                le CV
              </button>
            )}

            {coverLetterId && (
              <button
                type="button"
                onClick={() =>
                  void downloadDocument(
                    'letter',
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <DownloadIcon />

                Télécharger
                la lettre
              </button>
            )}

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FEEDBACK
// ============================================================

function FeedbackBox({
  feedback,
}: {
  feedback:
    ActionFeedback;
}) {
  const classes = {
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-800',

    error:
      'border-red-200 bg-red-50 text-red-800',

    info:
      'border-blue-200 bg-blue-50 text-blue-800',
  };

  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${classes[feedback.type]}`}
    >
      {
        feedback.message
      }
    </div>
  );
}

// ============================================================
// PREPARATION STEP
// ============================================================

function PreparationStep({
  label,
  description,
  status,
}: {
  label: string;

  description: string;

  status:
    PreparationStepStatus;
}) {
  return (
    <div className="flex gap-4 rounded-xl px-3 py-3">
      <div
        className={[
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',

          status ===
          'done'
            ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
            : '',

          status ===
          'active'
            ? 'border-gray-950 bg-gray-950 text-white'
            : '',

          status ===
          'pending'
            ? 'border-gray-200 bg-white text-gray-300'
            : '',
        ].join(' ')}
      >
        {status ===
          'done' && (
          <CheckIcon className="h-4 w-4" />
        )}

        {status ===
          'active' && (
          <SmallSpinner />
        )}

        {status ===
          'pending' && (
          <span className="h-2 w-2 rounded-full bg-gray-300" />
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {
            description
          }
        </p>
      </div>
    </div>
  );
}

// ============================================================
// STEP STATUS
// ============================================================

function getStepStatus(
  index: number,
  activeStep: number,
): PreparationStepStatus {
  if (
    activeStep >=
    PREPARATION_STEPS.length
  ) {
    return 'done';
  }

  if (
    index <
    activeStep
  ) {
    return 'done';
  }

  if (
    index ===
    activeStep
  ) {
    return 'active';
  }

  return 'pending';
}

// ============================================================
// SUCCESS ROW
// ============================================================

function SuccessRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckIcon className="h-3.5 w-3.5" />
        </div>

        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

// ============================================================
// DOCUMENT CARD
// ============================================================

function DocumentReadyCard({
  title,
  available,
}: {
  title: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3">
      <div
        className={[
          'flex h-8 w-8 items-center justify-center rounded-lg',

          available
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-400',
        ].join(' ')}
      >
        {available ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          '—'
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="text-xs text-gray-500">
          {available
            ? 'Document prêt'
            : 'Non disponible'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// APPLICATION METHOD BADGE
// ============================================================

function ApplicationMethodBadge({
  method,
}: {
  method: string;
}) {
  const labels: Record<
    string,
    {
      label: string;
      classes: string;
    }
  > = {
    FRANCE_TRAVAIL: {
      label:
        'France Travail',

      classes:
        'bg-blue-100 text-blue-800',
    },

    PARTNER: {
      label:
        'Site partenaire',

      classes:
        'bg-purple-100 text-purple-800',
    },

    EXTERNAL_SITE: {
      label:
        'Site externe',

      classes:
        'bg-purple-100 text-purple-800',
    },

    EMAIL: {
      label:
        'Email',

      classes:
        'bg-orange-100 text-orange-800',
    },

    MANUAL: {
      label:
        'Manuel',

      classes:
        'bg-gray-100 text-gray-700',
    },
  };

  const config =
    labels[
      method
    ] ?? {
      label:
        method,

      classes:
        'bg-gray-100 text-gray-700',
    };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${config.classes}`}
    >
      {
        config.label
      }
    </span>
  );
}

// ============================================================
// STATUS
// ============================================================

function ApplicationStatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    getApplicationStatusConfig(
      status,
    );

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${config.classes}`}
    >
      {
        config.label
      }
    </span>
  );
}

function getApplicationStatusConfig(
  status: string,
) {
  const labels: Record<
    string,
    {
      label: string;
      classes: string;
    }
  > = {
    DRAFT: {
      label:
        'Brouillon',

      classes:
        'bg-gray-100 text-gray-700',
    },

    READY_TO_VALIDATE: {
      label:
        'Prête à valider',

      classes:
        'bg-amber-100 text-amber-800',
    },

    APPROVED: {
      label:
        'Validée',

      classes:
        'bg-blue-100 text-blue-800',
    },

    SENDING: {
      label:
        'Envoi en cours',

      classes:
        'bg-purple-100 text-purple-800',
    },

    SENT: {
      label:
        'Envoyée',

      classes:
        'bg-emerald-100 text-emerald-800',
    },

    FAILED: {
      label:
        'Échec',

      classes:
        'bg-red-100 text-red-700',
    },

    RESPONSE_RECEIVED: {
      label:
        'Réponse reçue',

      classes:
        'bg-indigo-100 text-indigo-800',
    },

    INTERVIEW: {
      label:
        'Entretien',

      classes:
        'bg-emerald-100 text-emerald-800',
    },

    REJECTED: {
      label:
        'Refus',

      classes:
        'bg-red-100 text-red-700',
    },

    FOLLOW_UP: {
      label:
        'À relancer',

      classes:
        'bg-orange-100 text-orange-800',
    },

    ARCHIVED: {
      label:
        'Archivée',

      classes:
        'bg-gray-100 text-gray-500',
    },
  };

  return (
    labels[
      status
    ] ?? {
      label:
        status,

      classes:
        'bg-gray-100 text-gray-700',
    }
  );
}

function formatApplicationStatus(
  status: string,
) {
  return getApplicationStatusConfig(
    status,
  ).label;
}

// ============================================================
// SKILLS
// ============================================================

function SkillsBlock({
  title,
  skills,
  variant,
}: {
  title: string;

  skills: string[];

  variant:
    | 'neutral'
    | 'success'
    | 'danger'
    | 'technology';
}) {
  const styles = {
    neutral:
      'bg-gray-100 text-gray-700',

    success:
      'bg-emerald-100 text-emerald-800',

    danger:
      'bg-red-100 text-red-700',

    technology:
      'bg-purple-100 text-purple-800',
  };

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-semibold text-gray-800">
        {title}
      </p>

      <div className="flex flex-wrap gap-2">
        {skills.map(
          (skill) => (
            <span
              key={
                skill
              }
              className={`rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}
            >
              {variant ===
                'success' &&
                '✓ '}

              {variant ===
                'danger' &&
                '✕ '}

              {skill}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

// ============================================================
// ERROR RESPONSE
// ============================================================

async function readErrorMessage(
  response:
    Response,

  fallback:
    string,
) {
  try {
    const text =
      await response.text();

    if (!text) {
      return fallback;
    }

    try {
      const json =
        JSON.parse(
          text,
        );

      if (
        typeof json.message ===
        'string'
      ) {
        return json.message;
      }

      if (
        Array.isArray(
          json.message,
        )
      ) {
        return json.message.join(
          ', ',
        );
      }
    } catch {
      // response text classique
    }

    return text;
  } catch {
    return fallback;
  }
}

// ============================================================
// ICONS
// ============================================================

function CheckIcon({
  className =
    'h-4 w-4',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        className
      }
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        d="M5 12l4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M7 3h7l4 4v14H7V3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14 3v5h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 13h5M10 17h5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 3v12"
        strokeLinecap="round"
      />

      <path
        d="m7 10 5 5 5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 21h14"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================
// SPINNERS
// ============================================================

function MainSpinner() {
  return (
    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-950" />
  );
}

function MainSpinnerLight() {
  return (
    <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
  );
}

function SmallSpinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

// ============================================================
// SOURCE
// ============================================================

function formatSource(
  source: string,
) {
  const labels: Record<
    string,
    string
  > = {
    FRANCE_TRAVAIL:
      'France Travail',

    ADZUNA:
      'Adzuna',

    JOOBLE:
      'Jooble',

    FREE_WORK:
      'Free-Work',

    HELLOWORK:
      'HelloWork',

    WTTJ:
      'Welcome to the Jungle',

    LINKEDIN:
      'LinkedIn',

    INDEED:
      'Indeed',
  };

  return (
    labels[source] ??
    source
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
      day:
        '2-digit',

      month:
        '2-digit',

      year:
        'numeric',
    },
  ).format(
    new Date(
      value,
    ),
  );
}