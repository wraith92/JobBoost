'use client';

import {
  useParams,
} from 'next/navigation';

import CoverLetterDocument
  from '../../../components/cover-letter/CoverLetterDocument';

import CoverLetterHeader
  from '../../../components/cover-letter/CoverLetterHeader';

import CoverLetterLoading
  from '../../../components/cover-letter/CoverLetterLoading';

import CoverLetterMetaCard
  from '../../../components/cover-letter/CoverLetterMetaCard';

import {
  useCoverLetterPage,
} from '../../../components/cover-letter/useCoverLetterPage';

export default function CoverLetterPage() {
  const params =
    useParams();

  const letterId =
    params.id as string;

  const state =
    useCoverLetterPage(
      letterId,
    );

  if (
    state.loading
  ) {
    return (
      <CoverLetterLoading />
    );
  }

  if (
    !state.letter
  ) {
    return (
      <main className="cover-letter-page">
        <div className="cover-letter-container">
          <div className="cover-letter-empty">
            <p
              className="
                text-[13px]
                font-semibold
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Lettre introuvable
            </p>

            <p
              className="
                mt-2
                text-[10px]
                text-zinc-400
              "
            >
              {state.error ||
                'Le document demandé n’existe pas.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cover-letter-page">
      <div
        className="
          cover-letter-container
          space-y-6
        "
      >
        <CoverLetterHeader
          letter={
            state.letter
          }
          copied={
            state.copied
          }
          preparing={
            state.preparing
          }
          onBack={
            state.goBack
          }
          onCopy={() =>
            void state.copyLetter()
          }
          onPrepare={() =>
            void state.prepareApplication()
          }
        />

        <div
          className="
            grid gap-5

            xl:grid-cols-[minmax(0,1fr)_300px]
          "
        >
          <CoverLetterDocument
            letter={
              state.letter
            }
          />

          <CoverLetterMetaCard
            letter={
              state.letter
            }
          />
        </div>
      </div>
    </main>
  );
}