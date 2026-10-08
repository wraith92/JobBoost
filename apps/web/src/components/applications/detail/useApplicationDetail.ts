'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  API_URL,
} from '../applications.constants';

import {
  readErrorMessage,
} from '../applications.utils';

import type {
  ApplicationDetail,
  SaveFeedback,
} from './application-detail.types';

export function useApplicationDetail(
  applicationId: string,
) {
  const [
    application,
    setApplication,
  ] = useState<ApplicationDetail | null>(
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
    error,
    setError,
  ] = useState('');

  const [
    feedback,
    setFeedback,
  ] = useState<SaveFeedback | null>(
    null,
  );

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

  // ============================================================
  // LOAD
  // ============================================================

  const loadApplication =
    useCallback(
      async () => {
        if (
          !applicationId
        ) {
          return;
        }

        try {
          setLoading(
            true,
          );

          setError(
            '',
          );

          const response =
            await fetch(
              `${API_URL}/applications/${applicationId}`,
              {
                cache:
                  'no-store',
              },
            );

          if (
            !response.ok
          ) {
            throw new Error(
              await readErrorMessage(
                response,
                'Candidature introuvable.',
              ),
            );
          }

          const data =
            (await response.json()) as ApplicationDetail;

          setApplication(
            data,
          );

          setChannel(
            data.channel ??
              '',
          );

          setNotes(
            data.notes ??
              '',
          );

          setFollowUpAt(
            data.followUpAt
              ? data.followUpAt.slice(
                  0,
                  16,
                )
              : '',
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
              : 'Impossible de charger la candidature.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        applicationId,
      ],
    );

  useEffect(() => {
    void loadApplication();
  }, [
    loadApplication,
  ]);

  // ============================================================
  // DIRTY STATE
  // ============================================================

  const isDirty =
    useMemo(() => {
      if (
        !application
      ) {
        return false;
      }

      const originalFollowUp =
        application.followUpAt
          ? application.followUpAt.slice(
              0,
              16,
            )
          : '';

      return (
        channel !==
          (
            application.channel ??
            ''
          ) ||
        notes !==
          (
            application.notes ??
            ''
          ) ||
        followUpAt !==
          originalFollowUp
      );
    }, [
      application,
      channel,
      notes,
      followUpAt,
    ]);

  // ============================================================
  // SAVE
  // ============================================================

  async function saveApplication() {
    if (
      !application
    ) {
      return;
    }

    try {
      setSaving(
        true,
      );

      setFeedback(
        null,
      );

      const response =
        await fetch(
          `${API_URL}/applications/${application.id}`,
          {
            method:
              'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                channel:
                  channel ||
                  null,

                notes:
                  notes ||
                  null,

                followUpAt:
                  followUpAt ||
                  null,
              }),
          },
        );

      if (
        !response.ok
      ) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de sauvegarder la candidature.',
          ),
        );
      }

      const updated =
        (await response.json()) as ApplicationDetail;

      setApplication(
        updated,
      );

      setChannel(
        updated.channel ??
          '',
      );

      setNotes(
        updated.notes ??
          '',
      );

      setFollowUpAt(
        updated.followUpAt
          ? updated.followUpAt.slice(
              0,
              16,
            )
          : '',
      );

      setFeedback({
        type:
          'success',

        message:
          'Les informations de suivi ont été sauvegardées.',
      });
    } catch (
      currentError
    ) {
      console.error(
        currentError,
      );

      setFeedback({
        type:
          'error',

        message:
          currentError instanceof
            Error
            ? currentError.message
            : 'Erreur pendant la sauvegarde.',
      });
    } finally {
      setSaving(
        false,
      );
    }
  }

  return {
    application,

    loading,
    error,

    saving,
    feedback,

    channel,
    setChannel,

    notes,
    setNotes,

    followUpAt,
    setFollowUpAt,

    isDirty,

    loadApplication,

    saveApplication,
  };
}