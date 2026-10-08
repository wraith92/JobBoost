'use client';

import {
  useParams,
} from 'next/navigation';

import ResumeDocument
  from '../../../components/resume/ResumeDocument';

import ResumeLoading
  from '../../../components/resume/ResumeLoading';

import ResumePageHeader
  from '../../../components/resume/ResumePageHeader';

import {
  useResumePage,
} from '../../../components/resume/useResumePage';

export default function ResumePage() {
  const params =
    useParams();

  const resumeId =
    params.id as string;

  const state =
    useResumePage(
      resumeId,
    );

  if (
    state.loading
  ) {
    return (
      <ResumeLoading />
    );
  }

  if (
    !state.resume
  ) {
    return (
      <main className="resume-page">
        <div className="resume-container">
          <div
            className="
              resume-empty-card
            "
          >
            <p
              className="
                text-[13px]
                font-semibold
                text-zinc-700

                dark:text-zinc-300
              "
            >
              CV introuvable
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
    <main className="resume-page">
      <div
        className="
          resume-container
          space-y-6
        "
      >
        <ResumePageHeader
          resume={
            state.resume
          }
          generatingLetter={
            state.generatingLetter
          }
          onBack={
            state.goBack
          }
          onGenerateLetter={() =>
            void state.generateCoverLetter()
          }
        />

        <ResumeDocument
          resume={
            state.resume
          }
        />
      </div>
    </main>
  );
}