'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  API_URL,
} from './applications.constants';

import type {
  Application,
  ApplicationStatus,
  PageSize,
  SendApplicationResponse,
} from './applications.types';

import {
  readErrorMessage,
} from './applications.utils';

export function useApplicationsPage() {
  const [
    applications,
    setApplications,
  ] = useState<
    Application[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    error,
    setError,
  ] = useState(
    '',
  );

  const [
    updatingId,
    setUpdatingId,
  ] = useState<
    string | null
  >(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState(
    '',
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    ApplicationStatus |
    'ALL'
  >(
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

  // ============================================================
  // LOAD
  // ============================================================

  const loadApplications =
    useCallback(
      async () => {
        try {
          setLoading(
            true,
          );

          setError(
            '',
          );

          const response =
            await fetch(
              `${API_URL}/applications`,
              {
                cache:
                  'no-store',
              },
            );

          if (
            !response.ok
          ) {
            throw new Error(
              'Impossible de charger les candidatures.',
            );
          }

          const data =
            (await response.json()) as Application[];

          setApplications(
            data,
          );
        } catch (
          currentError
        ) {
          console.error(
            currentError,
          );

          setError(
            currentError instanceof
              Error
              ? currentError.message
              : 'Erreur pendant le chargement.',
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
    void loadApplications();
  }, [
    loadApplications,
  ]);

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  async function updateStatus(
    applicationId:
      string,

    status:
      ApplicationStatus,
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

      if (
        !response.ok
      ) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de modifier le statut.',
          ),
        );
      }

      await loadApplications();
    } catch (
      currentError
    ) {
      console.error(
        currentError,
      );

      alert(
        currentError instanceof
          Error
          ? currentError.message
          : 'Erreur pendant la mise à jour.',
      );
    } finally {
      setUpdatingId(
        null,
      );
    }
  }

  // ============================================================
  // SEND
  // ============================================================

  async function sendApplication(
    application:
      Application,
  ) {
    const score =
      application.job
        .analysis?.score ??
      null;

    if (
      score !==
        null &&
      score < 50
    ) {
      const confirmed =
        window.confirm(
          `Cette offre a seulement ${score}% de compatibilité.\n\nVeux-tu quand même continuer vers la candidature ?`,
        );

      if (
        !confirmed
      ) {
        return;
      }
    }

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
          'JobBoost';

        popup.document.body.innerHTML =
          `
            <div style="
              font-family: Arial, sans-serif;
              padding: 40px;
              text-align: center;
            ">
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
        (await response.json()) as SendApplicationResponse;

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
          window.location.href =
            result.url;
        }

        await loadApplications();

        return;
      }

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

        return;
      }

      if (
        result.action ===
        'EMAIL_PENDING'
      ) {
        popup?.close();

        await loadApplications();

        alert(
          result.email
            ? `Candidature validée. Envoi email prévu vers ${result.email}.`
            : 'Candidature validée. Envoi email en attente.',
        );

        return;
      }

      popup?.close();

      await loadApplications();
    } catch (
      currentError
    ) {
      popup?.close();

      console.error(
        currentError,
      );

      alert(
        currentError instanceof
          Error
          ? currentError.message
          : 'Erreur pendant la candidature.',
      );
    } finally {
      setUpdatingId(
        null,
      );
    }
  }

  // ============================================================
  // FILTER
  // ============================================================

  const filteredApplications =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase();

      return applications
        .filter(
          (
            application,
          ) => {
            const text = [
              application.job
                .title,

              application.job
                .company,

              application.job
                .location,

              application.job
                .source,

              application.channel,

              application.job
                .applicationMethod,
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

            const matchesStatus =
              statusFilter ===
                'ALL' ||
              application.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          },
        )
        .sort(
          (
            a,
            b,
          ) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        );
    }, [
      applications,
      search,
      statusFilter,
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
    statusFilter,
    pageSize,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredApplications
          .length /
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

  const paginatedApplications =
    useMemo(() => {
      const start =
        (
          page -
          1
        ) *
        pageSize;

      return filteredApplications.slice(
        start,
        start +
          pageSize,
      );
    }, [
      filteredApplications,
      page,
      pageSize,
    ]);

  const firstItem =
    filteredApplications
      .length === 0
      ? 0
      : (
          page -
          1
        ) *
          pageSize +
        1;

  const lastItem =
    Math.min(
      page *
        pageSize,
      filteredApplications
        .length,
    );

  return {
    applications,

    filteredApplications,
    paginatedApplications,

    loading,
    error,

    updatingId,

    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    page,
    setPage,

    pageSize,
    setPageSize,

    totalPages,
    firstItem,
    lastItem,

    loadApplications,

    updateStatus,
    sendApplication,
  };
}