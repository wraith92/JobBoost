'use client';

import {
  Check,
  FileText,
  LoaderCircle,
  Mail,
  Send,
  Sparkles,
  X,
} from 'lucide-react';

import Link from 'next/link';

import FeedbackBox
  from './FeedbackBox';

import {
  ApplicationStatusBadge,
} from './JobsBadges';

import {
  PREPARATION_STEPS,
} from './jobs.constants';

import {
  getStepStatus,
} from './jobs.utils';

import type {
  ActionFeedback,
  DocumentTab,
  Job,
  PreparedApplication,
  PreparationStatus,
} from './jobs.types';

export default function PreparationModal({
  status,
  progress,
  step,
  jobTitle,
  error,
  result,
  alreadyPrepared,
  feedback,
  job,

  sending,
  confirming,

  onClose,
  onOpenDocuments,
  onSend,
  onConfirm,
  onReopen,
}: {
  status:
    PreparationStatus;

  progress: number;
  step: number;

  jobTitle: string;
  error: string;

  result:
    | PreparedApplication
    | null;

  alreadyPrepared: boolean;

  feedback:
    | ActionFeedback
    | null;

  job:
    | Job
    | null;

  sending: boolean;
  confirming: boolean;

  onClose:
    () => void;

  onOpenDocuments:
    (
      tab:
        DocumentTab,
    ) => void;

  onSend:
    () => void;

  onConfirm:
    () => void;

  onReopen:
    () => void;
}) {
  if (
    status ===
    'idle'
  ) {
    return null;
  }

  return (
    <div className="jobs-modal-backdrop">
      <div className="jobs-modal-panel">

        <div
          className="
            flex items-start
            justify-between
            gap-5
            border-b
            border-zinc-100
            px-6 py-5

            dark:border-white/[0.06]
          "
        >
          <div
            className="
              flex min-w-0
              items-start
              gap-3
            "
          >
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-violet-500
                to-fuchsia-500
                text-white
                shadow-[0_7px_20px_rgba(168,85,247,.20)]
              "
            >
              <Sparkles
                size={18}
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-violet-500

                  dark:text-violet-300
                "
              >
                JobBoost AI
              </p>

              <h2
                className="
                  mt-1
                  text-[17px]
                  font-semibold
                  text-zinc-950

                  dark:text-zinc-50
                "
              >
                {status ===
                'loading'
                  ? 'Préparation de la candidature'
                  : status ===
                      'success'
                    ? alreadyPrepared
                      ? 'Candidature déjà préparée'
                      : 'Candidature prête'
                    : 'Préparation interrompue'}
              </h2>

              <p
                className="
                  mt-1
                  max-w-md
                  truncate
                  text-[10px]
                  text-zinc-400
                "
              >
                {jobTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="jobs-modal-close"
          >
            <X
              size={16}
            />
          </button>
        </div>

        {/* LOADING */}

        {status ===
          'loading' && (
          <div className="px-6 py-5">
            <div
              className="
                flex items-center
                justify-between
                text-[10px]
              "
            >
              <span className="text-zinc-400">
                Progression
              </span>

              <span
                className="
                  font-semibold
                  text-zinc-800

                  dark:text-zinc-200
                "
              >
                {progress}%
              </span>
            </div>

            <div
              className="
                mt-2
                h-1.5
                overflow-hidden
                rounded-full
                bg-zinc-100

                dark:bg-white/[0.06]
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-violet-500
                  to-fuchsia-500
                  transition-all
                  duration-700
                "
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>

            <div className="mt-5 space-y-1">
              {PREPARATION_STEPS.map(
                (
                  item,
                  index,
                ) => {
                  const current =
                    getStepStatus(
                      index,
                      step,
                    );

                  return (
                    <div
                      key={
                        item.label
                      }
                      className="
                        flex items-start
                        gap-3
                        rounded-xl
                        px-2 py-2.5
                      "
                    >
                      <div
                        className={`
                          flex h-7 w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border

                          ${
                            current ===
                            'done'
                              ? `
                                border-emerald-200
                                bg-emerald-50
                                text-emerald-600

                                dark:border-emerald-400/15
                                dark:bg-emerald-500/10
                                dark:text-emerald-300
                              `
                              : current ===
                                  'active'
                                ? `
                                  border-violet-500
                                  bg-violet-500
                                  text-white
                                `
                                : `
                                  border-zinc-200
                                  bg-zinc-50
                                  text-zinc-300

                                  dark:border-white/[0.07]
                                  dark:bg-white/[0.03]
                                  dark:text-zinc-600
                                `
                          }
                        `}
                      >
                        {current ===
                        'done' ? (
                          <Check
                            size={13}
                          />
                        ) : current ===
                          'active' ? (
                          <LoaderCircle
                            size={13}
                            className="animate-spin"
                          />
                        ) : (
                          <span
                            className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-current
                            "
                          />
                        )}
                      </div>

                      <div>
                        <p
                          className="
                            text-[11px]
                            font-semibold
                            text-zinc-800

                            dark:text-zinc-200
                          "
                        >
                          {
                            item.label
                          }
                        </p>

                        <p
                          className="
                            mt-[2px]
                            text-[9px]
                            text-zinc-400
                          "
                        >
                          {
                            item.description
                          }
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {status ===
          'success' &&
          result && (
          <div className="px-6 py-5">
            <div
              className="
                flex items-center
                gap-3
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                px-4 py-3

                dark:border-emerald-400/15
                dark:bg-emerald-500/[0.07]
              "
            >
              <div
                className="
                  flex h-8 w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500
                  text-white
                "
              >
                <Check
                  size={15}
                />
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    text-emerald-800

                    dark:text-emerald-200
                  "
                >
                  Documents disponibles
                </p>

                <p
                  className="
                    mt-[2px]
                    text-[9px]
                    text-emerald-700/70

                    dark:text-emerald-300/60
                  "
                >
                  CV et lettre prêts
                  pour vérification.
                </p>
              </div>

              <div className="ml-auto">
                <ApplicationStatusBadge
                  status={
                    result.status
                  }
                />
              </div>
            </div>

            <div
              className="
                mt-4
                grid gap-2
                sm:grid-cols-2
              "
            >
              <button
                type="button"
                disabled={
                  !result.resumeId
                }
                onClick={() =>
                  onOpenDocuments(
                    'resume',
                  )
                }
                className="jobs-small-button"
              >
                <FileText
                  size={13}
                />

                Voir le CV
              </button>

              <button
                type="button"
                disabled={
                  !result.coverLetterId
                }
                onClick={() =>
                  onOpenDocuments(
                    'letter',
                  )
                }
                className="jobs-small-button"
              >
                <Mail
                  size={13}
                />

                Voir la lettre
              </button>
            </div>

            {feedback && (
              <FeedbackBox
                feedback={
                  feedback
                }
              />
            )}

            <div
              className="
                mt-5
                flex flex-wrap
                gap-2
              "
            >
              {(result.status ===
                'READY_TO_VALIDATE' ||
                result.status ===
                  'FAILED') && (
                <button
                  type="button"
                  disabled={
                    sending
                  }
                  onClick={
                    onSend
                  }
                  className="jobs-primary-small-button"
                >
                  <Send
                    size={13}
                  />

                  {sending
                    ? 'Ouverture...'
                    : 'Valider et postuler'}
                </button>
              )}

              {result.status ===
                'APPROVED' && (
                <button
                  type="button"
                  disabled={
                    confirming
                  }
                  onClick={
                    onConfirm
                  }
                  className="jobs-success-small-button"
                >
                  <Check
                    size={13}
                  />

                  Confirmer l&apos;envoi
                </button>
              )}

              {result.status ===
                'APPROVED' &&
                job &&
                (job.applicationUrl ||
                  job.url) && (
                  <button
                    type="button"
                    onClick={
                      onReopen
                    }
                    className="jobs-small-button"
                  >
                    Rouvrir le site
                  </button>
                )}

              <Link
                href={`/applications/${result.applicationId}`}
                className="jobs-small-button"
              >
                Voir le suivi
              </Link>

              <button
                type="button"
                onClick={
                  onClose
                }
                className="jobs-ghost-button"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}

        {status ===
          'error' && (
          <div className="px-6 py-5">
            <div
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
                text-[11px]
                leading-5
                text-red-700

                dark:border-red-400/15
                dark:bg-red-500/10
                dark:text-red-300
              "
            >
              {error}
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                jobs-primary-small-button
                mt-4
              "
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}