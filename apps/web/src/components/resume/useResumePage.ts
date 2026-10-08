'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  API_URL,
} from './resume.constants';

import type {
  Resume,
} from './resume.types';

import {
  readErrorMessage,
} from './resume.utils';

export function useResumePage(
  resumeId: string,
) {
  const router =
    useRouter();

  const [
    resume,
    setResume,
  ] = useState<
    Resume | null
  >(
    null,
  );

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
    generatingLetter,
    setGeneratingLetter,
  ] = useState(
    false,
  );

  // ============================================================
  // LOAD
  // ============================================================

  const loadResume =
    useCallback(
      async () => {
        if (
          !resumeId
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
              `${API_URL}/resume/${resumeId}`,
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
                'Impossible de charger le CV.',
              ),
            );
          }

          const data =
            (await response.json()) as Resume;

          setResume(
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
              : 'Impossible de charger le CV.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        resumeId,
      ],
    );

  useEffect(() => {
    void loadResume();
  }, [
    loadResume,
  ]);

  // ============================================================
  // COVER LETTER
  // ============================================================

  async function generateCoverLetter() {
    if (
      !resume ||
      generatingLetter
    ) {
      return;
    }

    try {
      setGeneratingLetter(
        true,
      );

      const response =
        await fetch(
          `${API_URL}/cover-letter/jobs/${resume.jobId}/generate`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                resumeId:
                  resume.id,
              }),
          },
        );

      if (
        !response.ok
      ) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de générer la lettre.',
          ),
        );
      }

      const letter =
        await response.json();

      if (
        !letter.id
      ) {
        throw new Error(
          'ID de lettre introuvable.',
        );
      }

      router.push(
        `/cover-letter/${letter.id}`,
      );
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
          : 'Erreur pendant la génération.',
      );
    } finally {
      setGeneratingLetter(
        false,
      );
    }
  }

  return {
    resume,

    loading,
    error,

    generatingLetter,

    loadResume,

    generateCoverLetter,

    goBack:
      () =>
        router.back(),
  };
}