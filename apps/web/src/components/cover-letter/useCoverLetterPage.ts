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
} from './cover-letter.constants';

import type {
  CoverLetter,
  CreatedApplication,
} from './cover-letter.types';

import {
  readErrorMessage,
} from './cover-letter.utils';

export function useCoverLetterPage(
  letterId: string,
) {
  const router =
    useRouter();

  const [
    letter,
    setLetter,
  ] = useState<
    CoverLetter | null
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
    copied,
    setCopied,
  ] = useState(
    false,
  );

  const [
    preparing,
    setPreparing,
  ] = useState(
    false,
  );

  // ============================================================
  // LOAD
  // ============================================================

  const loadLetter =
    useCallback(
      async () => {
        if (
          !letterId
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
              `${API_URL}/cover-letter/${letterId}`,
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
                'Impossible de charger la lettre.',
              ),
            );
          }

          const data =
            (await response.json()) as CoverLetter;

          setLetter(
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
              : 'Impossible de charger la lettre.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        letterId,
      ],
    );

  useEffect(() => {
    void loadLetter();
  }, [
    loadLetter,
  ]);

  // ============================================================
  // COPY
  // ============================================================

  async function copyLetter() {
    if (
      !letter
    ) {
      return;
    }

    try {
      await navigator.clipboard
        .writeText(
          letter.content,
        );

      setCopied(
        true,
      );

      window.setTimeout(
        () =>
          setCopied(
            false,
          ),
        2000,
      );
    } catch (
      currentError
    ) {
      console.error(
        currentError,
      );

      alert(
        'Impossible de copier la lettre.',
      );
    }
  }

  // ============================================================
  // APPLICATION
  // ============================================================

  async function prepareApplication() {
    if (
      !letter ||
      preparing
    ) {
      return;
    }

    try {
      setPreparing(
        true,
      );

      const response =
        await fetch(
          `${API_URL}/applications`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                jobId:
                  letter.jobId,

                resumeId:
                  letter.resumeId,

                coverLetterId:
                  letter.id,

                channel:
                  'MANUAL',
              }),
          },
        );

      if (
        !response.ok
      ) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de créer la candidature.',
          ),
        );
      }

      const application =
        (await response.json()) as CreatedApplication;

      if (
        application.id
      ) {
        router.push(
          `/applications/${application.id}`,
        );

        return;
      }

      router.push(
        '/applications',
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
          : 'Erreur pendant la création de la candidature.',
      );
    } finally {
      setPreparing(
        false,
      );
    }
  }

  return {
    letter,

    loading,
    error,

    copied,
    preparing,

    copyLetter,

    prepareApplication,

    goBack:
      () =>
        router.back(),
  };
}