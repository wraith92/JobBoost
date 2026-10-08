'use client';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  API_URL,
  PREPARATION_STEPS,
  PREPARE_TIMEOUT_MS,
} from './jobs.constants';
import {
  normalizePrepareResponse,
  readErrorMessage,
} from './jobs.utils';
import type {
  ActionFeedback,
  DocumentTab,
  DocumentsModalState,
  ExistingApplication,
  Job,
  PageSize,
  PreparedApplication,
  PrepareResponse,
  PreparationStatus,
  SendResponse,
} from './jobs.types';
export function useJobsPage() {
  const [
    jobs,
    setJobs,
  ] = useState<
    Job[]
  >([]);
  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );
  const [
    loadError,
    setLoadError,
  ] = useState(
    '',
  );
  const [
    search,
    setSearch,
  ] = useState(
    '',
  );
  const [
    source,
    setSource,
  ] = useState(
    'ALL',
  );
  const [
    page,
    setPage,
  ] = useState(
    1,
  );
  const [
    pageSize,
    setPageSize,
  ] = useState<PageSize>(
    10,
  );
  const [
    analyzingJobId,
    setAnalyzingJobId,
  ] = useState<
    string | null
  >(
    null,
  );
  const [
    preparingJobId,
    setPreparingJobId,
  ] = useState<
    string | null
  >(
    null,
  );
  const [
    sendingApplicationId,
    setSendingApplicationId,
  ] = useState<
    string | null
  >(
    null,
  );
  const [
    confirmingApplicationId,
    setConfirmingApplicationId,
  ] = useState<
    string | null
  >(
    null,
  );
  const [
    deletingJobId,
    setDeletingJobId,
  ] = useState<
    string | null
  >(
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
  ] = useState(
    0,
  );
  const [
    preparationProgress,
    setPreparationProgress,
  ] = useState(
    0,
  );
  const [
    preparationJobId,
    setPreparationJobId,
  ] = useState<
    string | null
  >(
    null,
  );
  const [
    preparationJobTitle,
    setPreparationJobTitle,
  ] = useState(
    '',
  );
  const [
    preparationError,
    setPreparationError,
  ] = useState(
    '',
  );
  const [
    preparationResult,
    setPreparationResult,
  ] =
    useState<
      PreparedApplication |
      null
    >(
      null,
    );
  const [
    preparationAlreadyPrepared,
    setPreparationAlreadyPrepared,
  ] = useState(
    false,
  );
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
    exitingJobIds,
    setExitingJobIds,
  ] = useState<Set<string>>(
    new Set(),
  );
  const [
    sentToast,
    setSentToast,
  ] = useState<
    {
      jobTitle: string;
    } | null
  >(
    null,
  );
  const [
    documentsModal,
    setDocumentsModal,
  ] =
    useState<DocumentsModalState>({
      open:
        false,
      jobTitle:
        '',
      applicationId:
        null,
      resumeId:
        null,
      coverLetterId:
        null,
      initialTab:
        'resume',
    });
  const progressTimerRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(
      null,
    );
  const sentToastTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(
      null,
    );
  const exitTimersRef =
    useRef<
      Map<
        string,
        ReturnType<
          typeof setTimeout
        >
      >
    >(
      new Map(),
    );
  // ============================================================
  // LOAD
  // ============================================================
  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(
            true,
          );
          setLoadError(
            '',
          );
          const [
            jobsResponse,
            applicationsResponse,
          ] =
            await Promise.all([
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
            const map:
              Record<
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
        } catch (
          error
        ) {
          console.error(
            error,
          );
          setLoadError(
            error instanceof
              Error
              ? error.message
              : 'Impossible de charger les offres.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );
  useEffect(() => {
    void loadData();
  }, [
    loadData,
  ]);
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
      if (
        sentToastTimerRef.current
      ) {
        clearTimeout(
          sentToastTimerRef.current,
        );
      }
      for (
        const timer
        of exitTimersRef.current.values()
      ) {
        clearTimeout(
          timer,
        );
      }
      exitTimersRef.current.clear();
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
      if (
        !response.ok
      ) {
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
        (
          currentJobs,
        ) =>
          currentJobs.map(
            (
              job,
            ) =>
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
    } catch (
      error
    ) {
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
          (
            current,
          ) => {
            if (
              current >=
              92
            ) {
              return 92;
            }
            const increment =
              Math.floor(
                Math.random() *
                  6,
              ) + 2;
            const next =
              Math.min(
                current +
                  increment,
                92,
              );
            let nextStep =
              0;
            if (
              next >= 20
            ) {
              nextStep =
                1;
            }
            if (
              next >= 40
            ) {
              nextStep =
                2;
            }
            if (
              next >= 62
            ) {
              nextStep =
                3;
            }
            if (
              next >= 82
            ) {
              nextStep =
                4;
            }
            setPreparationStep(
              nextStep,
            );
            return next;
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
        () =>
          controller.abort(),
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
      if (
        !response.ok
      ) {
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
        (
          current,
        ) => ({
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
      try {
        const refresh =
          await fetch(
            `${API_URL}/jobs`,
            {
              cache:
                'no-store',
            },
          );
        if (
          refresh.ok
        ) {
          setJobs(
            (await refresh.json()) as Job[],
          );
        }
      } catch (
        refreshError
      ) {
        console.error(
          refreshError,
        );
      }
    } catch (
      error
    ) {
      stopVisualProgress();
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
          'La préparation a dépassé le délai maximum. Vérifiez le backend et Ollama puis réessayez.',
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
  // SEND
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
          'JobBoost';
      } catch {
        // Rien.
      }
    }
    try {
      setSendingApplicationId(
        prepared.applicationId,
      );
      setApplicationFeedback(
        (
          current,
        ) => ({
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
      if (
        !response.ok
      ) {
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
          (
            current,
          ) => ({
            ...current,
            [prepared.applicationId]:
              {
                type:
                  'success',
                message:
                  'Le site de candidature est ouvert. Terminez la candidature puis confirmez l’envoi.',
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
          (
            current,
          ) => ({
            ...current,
            [prepared.applicationId]:
              {
                type:
                  'info',
                message:
                  result.email
                    ? `Candidature email détectée pour ${result.email}.`
                    : 'Candidature email détectée.',
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
          (
            current,
          ) => ({
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
    } catch (
      error
    ) {
      if (
        popup &&
        !popup.closed
      ) {
        popup.close();
      }
      setApplicationFeedback(
        (
          current,
        ) => ({
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
  // CONFIRM SENT
  // ============================================================
  async function confirmApplicationSent(
    prepared:
      PreparedApplication,
  ) {
    if (
      confirmingApplicationId
    ) {
      return false;
    }
    const entry =
      Object.entries(
        preparedApplications,
      ).find(
        ([
          ,
          application,
        ]) =>
          application.applicationId ===
          prepared.applicationId,
      );
    const jobId =
      entry?.[0] ??
      null;
    const jobTitle =
      jobId
        ? jobs.find(
            (
              job,
            ) =>
              job.id ===
              jobId,
          )?.title ??
          'Candidature'
        : 'Candidature';
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
      if (
        !response.ok
      ) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de confirmer l’envoi.',
          ),
        );
      }
      if (
        jobId
      ) {
        setExitingJobIds(
          (
            current,
          ) => {
            const next =
              new Set(
                current,
              );
            next.add(
              jobId,
            );
            return next;
          },
        );
      }
      updateApplicationStatusLocally(
        prepared.applicationId,
        'SENT',
      );
      setApplicationFeedback(
        (
          current,
        ) => ({
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
      setSentToast({
        jobTitle,
      });
      if (
        sentToastTimerRef.current
      ) {
        clearTimeout(
          sentToastTimerRef.current,
        );
      }
      sentToastTimerRef.current =
        setTimeout(
          () => {
            setSentToast(
              null,
            );
            sentToastTimerRef.current =
              null;
          },
          2400,
        );
      if (
        jobId
      ) {
        const previousTimer =
          exitTimersRef.current.get(
            jobId,
          );
        if (
          previousTimer
        ) {
          clearTimeout(
            previousTimer,
          );
        }
        const exitTimer =
          setTimeout(
            () => {
              setExitingJobIds(
                (
                  current,
                ) => {
                  const next =
                    new Set(
                      current,
                    );
                  next.delete(
                    jobId,
                  );
                  return next;
                },
              );
              exitTimersRef.current.delete(
                jobId,
              );
            },
            380,
          );
        exitTimersRef.current.set(
          jobId,
          exitTimer,
        );
      }
      return true;
    } catch (
      error
    ) {
      setApplicationFeedback(
        (
          current,
        ) => ({
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
      return false;
    } finally {
      setConfirmingApplicationId(
        null,
      );
    }
  }
  // ============================================================
  // DELETE / ARCHIVE JOB
  // ============================================================
  async function deleteJob(
    job: Job,
  ) {
    if (
      deletingJobId
    ) {
      return;
    }
    const confirmed =
      window.confirm(
        `Supprimer cette offre des opportunités ?
${job.title}
Elle restera archivée pour ne pas être réimportée.`,
      );
    if (
      !confirmed
    ) {
      return;
    }
    try {
      setDeletingJobId(
        job.id,
      );
      const response =
        await fetch(
          `${API_URL}/jobs/${job.id}/archive`,
          {
            method:
              'POST',
          },
        );
      if (
        !response.ok
      ) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de supprimer cette offre.',
          ),
        );
      }
      setExitingJobIds(
        (
          current,
        ) => {
          const next =
            new Set(
              current,
            );
          next.add(
            job.id,
          );
          return next;
        },
      );
      const previousTimer =
        exitTimersRef.current.get(
          job.id,
        );
      if (
        previousTimer
      ) {
        clearTimeout(
          previousTimer,
        );
      }
      const exitTimer =
        setTimeout(
          () => {
            setJobs(
              (
                current,
              ) =>
                current.filter(
                  (
                    currentJob,
                  ) =>
                    currentJob.id !==
                    job.id,
                ),
            );
            setPreparedApplications(
              (
                current,
              ) => {
                const next = {
                  ...current,
                };
                delete next[
                  job.id
                ];
                return next;
              },
            );
            setExitingJobIds(
              (
                current,
              ) => {
                const next =
                  new Set(
                    current,
                  );
                next.delete(
                  job.id,
                );
                return next;
              },
            );
            exitTimersRef.current.delete(
              job.id,
            );
          },
          380,
        );
      exitTimersRef.current.set(
        job.id,
        exitTimer,
      );
    } catch (
      error
    ) {
      console.error(
        error,
      );
      window.alert(
        error instanceof
          Error
          ? error.message
          : 'Impossible de supprimer cette offre.',
      );
    } finally {
      setDeletingJobId(
        null,
      );
    }
  }
  // ============================================================
  // LOCAL STATUS
  // ============================================================
  function updateApplicationStatusLocally(
    applicationId: string,
    status: string,
  ) {
    setPreparedApplications(
      (
        current,
      ) => {
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
            application
              .applicationId ===
            applicationId
          ) {
            next[
              jobId
            ] = {
              ...application,
              status,
            };
          }
        }
        return next;
      },
    );
    setPreparationResult(
      (
        current,
      ) =>
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
  // EXTERNAL SITE
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
  // MODALS
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
  function openDocuments(
    jobTitle: string,
    prepared:
      PreparedApplication,
    initialTab:
      DocumentTab =
        'resume',
  ) {
    setDocumentsModal({
      open:
        true,
      jobTitle,
      applicationId:
        prepared.applicationId,
      resumeId:
        prepared.resumeId,
      coverLetterId:
        prepared.coverLetterId,
      initialTab,
    });
  }
  function closeDocuments() {
    setDocumentsModal(
      (
        current,
      ) => ({
        ...current,
        open:
          false,
      }),
    );
  }
  // ============================================================
  // FILTERS
  // ============================================================
  const sources =
    useMemo(() => {
      return Array.from(
        new Set(
          jobs.map(
            (
              job,
            ) =>
              job.source,
          ),
        ),
      ).sort();
    }, [
      jobs,
    ]);
  const filteredJobs =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase();
      return jobs.filter(
        (
          job,
        ) => {
          const prepared =
            preparedApplications[
              job.id
            ];
          const isSent =
            prepared?.status ===
            'SENT';
          const isExiting =
            exitingJobIds.has(
              job.id,
            );
          if (
            isSent &&
            !isExiting
          ) {
            return false;
          }
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
            .join(
              ' ',
            )
            .toLowerCase();
          const matchesSearch =
            !normalized ||
            text.includes(
              normalized,
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
      preparedApplications,
      exitingJobIds,
    ]);
  // ============================================================
  // PAGINATION
  // ============================================================
  useEffect(() => {
    setPage(
      1,
    );
  }, [
    search,
    source,
    pageSize,
  ]);
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredJobs.length /
          pageSize,
      ),
    );
  useEffect(() => {
    if (
      page >
      totalPages
    ) {
      setPage(
        totalPages,
      );
    }
  }, [
    page,
    totalPages,
  ]);
  const paginatedJobs =
    useMemo(() => {
      const start =
        (
          page -
          1
        ) *
        pageSize;
      return filteredJobs.slice(
        start,
        start +
          pageSize,
      );
    }, [
      filteredJobs,
      page,
      pageSize,
    ]);
  const firstResult =
    filteredJobs.length ===
    0
      ? 0
      : (
          page -
          1
        ) *
          pageSize +
        1;
  const lastResult =
    Math.min(
      page *
        pageSize,
      filteredJobs.length,
    );
  const preparationJob =
    preparationJobId
      ? jobs.find(
          (
            job,
          ) =>
            job.id ===
            preparationJobId,
        ) ??
        null
      : null;
  const preparationFeedback =
    preparationResult
      ? applicationFeedback[
          preparationResult
            .applicationId
        ] ??
        null
      : null;
  return {
    jobs,
    loading,
    loadError,
    search,
    setSearch,
    source,
    setSource,
    sources,
    filteredJobs,
    paginatedJobs,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    firstResult,
    lastResult,
    analyzingJobId,
    preparingJobId,
    sendingApplicationId,
    confirmingApplicationId,
    deletingJobId,
    exitingJobIds,
    sentToast,
    preparedApplications,
    applicationFeedback,
    preparationStatus,
    preparationStep,
    preparationProgress,
    preparationJobTitle,
    preparationError,
    preparationResult,
    preparationAlreadyPrepared,
    preparationJob,
    preparationFeedback,
    documentsModal,
    loadData,
    analyzeJob,
    prepareApplication,
    sendApplication,
    confirmApplicationSent,
    deleteJob,
    reopenApplicationSite,
    closePreparationModal,
    openDocuments,
    closeDocuments,
  };
}
