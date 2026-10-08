'use client';

import {
  useParams,
} from 'next/navigation';

import ApplicationDetailHeader
  from '../../../components/applications/detail/ApplicationDetailHeader';

import ApplicationDetailLoading
  from '../../../components/applications/detail/ApplicationDetailLoading';

import ApplicationDocumentsCard
  from '../../../components/applications/detail/ApplicationDocumentsCard';

import ApplicationOverview
  from '../../../components/applications/detail/ApplicationOverview';

import ApplicationStateCard
  from '../../../components/applications/detail/ApplicationStateCard';

import ApplicationTrackingForm
  from '../../../components/applications/detail/ApplicationTrackingForm';

import {
  useApplicationDetail,
} from '../../../components/applications/detail/useApplicationDetail';

export default function ApplicationPage() {
  const params =
    useParams();

  const applicationId =
    params.id as string;

  const state =
    useApplicationDetail(
      applicationId,
    );

  if (
    state.loading
  ) {
    return (
      <ApplicationDetailLoading />
    );
  }

  if (
    !state.application
  ) {
    return (
      <main className="application-detail-page">
        <div className="application-detail-container">
          <div
            className="
              application-detail-card
              py-16
              text-center
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
              Candidature introuvable
            </p>

            <p
              className="
                mt-2
                text-[10px]
                text-zinc-400
              "
            >
              {state.error ||
                'Le dossier demandé n’existe pas.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="application-detail-page">
      <div
        className="
          application-detail-container
          space-y-6
        "
      >
        <ApplicationDetailHeader
          application={
            state.application
          }
        />

        <div
          className="
            grid gap-5
            xl:grid-cols-[minmax(0,1fr)_350px]
          "
        >
          <div className="space-y-5">
            <ApplicationOverview
              application={
                state.application
              }
            />

            <ApplicationTrackingForm
              channel={
                state.channel
              }
              notes={
                state.notes
              }
              followUpAt={
                state.followUpAt
              }
              saving={
                state.saving
              }
              isDirty={
                state.isDirty
              }
              feedback={
                state.feedback
              }
              onChannelChange={
                state.setChannel
              }
              onNotesChange={
                state.setNotes
              }
              onFollowUpChange={
                state.setFollowUpAt
              }
              onSave={() =>
                void state.saveApplication()
              }
            />
          </div>

          <aside className="space-y-5">
            <ApplicationDocumentsCard
              application={
                state.application
              }
            />

            <ApplicationStateCard
              application={
                state.application
              }
            />
          </aside>
        </div>
      </div>
    </main>
  );
}