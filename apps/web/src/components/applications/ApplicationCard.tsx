'use client';

import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  RefreshCw,
  Send,
} from 'lucide-react';

import Link from 'next/link';

import {
  METHOD_LABELS,
  STATUS_LABELS,
} from './applications.constants';

import {
  MethodBadge,
  ScoreBadge,
  SourceBadge,
  StatusBadge,
} from './ApplicationBadges';

import type {
  Application,
  ApplicationStatus,
} from './applications.types';

import {
  formatDate,
  getStatusOptions,
} from './applications.utils';

export default function ApplicationCard({
  application,
  updating,

  onStatusChange,
  onSend,
}: {
  application:
    Application;

  updating: boolean;

  onStatusChange:
    (
      applicationId:
        string,

      status:
        ApplicationStatus,
    ) => Promise<void>;

  onSend:
    (
      application:
        Application,
    ) => Promise<void>;
}) {
  const score =
    application.job
      .analysis?.score ??
    null;

  const applicationUrl =
    application.job
      .applicationUrl ??
    application.job.url;

  const statusOptions =
    getStatusOptions(
      application.status,
    );

  return (
    <article className="application-card">
      <div
        className="
          grid gap-5
          xl:grid-cols-[minmax(0,1fr)_270px]
        "
      >
        {/* ==================================================== */}
        {/* CONTENT */}
        {/* ==================================================== */}

        <div className="min-w-0">

          <div
            className="
              flex flex-wrap
              items-center
              gap-1.5
            "
          >
            <StatusBadge
              status={
                application.status
              }
            />

            <ScoreBadge
              score={
                score
              }
            />

            <SourceBadge
              source={
                application.job
                  .source
              }
            />

            <MethodBadge
              method={
                application.job
                  .applicationMethod
              }
            />
          </div>

          <div className="mt-4">
            <Link
              href={`/applications/${application.id}`}
              className="
                group/title
                inline-flex
                items-center
                gap-2
              "
            >
              <h2
                className="
                  text-[15px]
                  font-semibold
                  tracking-[-0.015em]
                  text-zinc-950

                  transition

                  group-hover/title:text-violet-600

                  dark:text-zinc-50
                  dark:group-hover/title:text-violet-300
                "
              >
                {
                  application.job
                    .title
                }
              </h2>

              <ArrowUpRight
                size={13}
                className="
                  text-zinc-300
                  transition

                  group-hover/title:text-violet-500
                "
              />
            </Link>
          </div>

          {/* META */}

          <div
            className="
              mt-3
              flex flex-wrap
              gap-x-5
              gap-y-2
            "
          >
            {application.job
              .company && (
              <Meta
                icon={
                  BriefcaseBusiness
                }
                value={
                  application.job
                    .company
                }
              />
            )}

            {application.job
              .location && (
              <Meta
                icon={
                  MapPin
                }
                value={
                  application.job
                    .location
                }
              />
            )}

            <Meta
              icon={
                CalendarDays
              }
              value={`Créée le ${formatDate(
                application.createdAt,
              )}`}
            />

            {application.appliedAt && (
              <Meta
                icon={
                  Send
                }
                value={`Envoyée le ${formatDate(
                  application.appliedAt,
                )}`}
              />
            )}
          </div>

          {/* DOCUMENTS */}

          <div
            className="
              mt-4
              flex flex-wrap
              gap-2
            "
          >
            {application.resume && (
              <Link
                href={`/resume/${application.resume.id}`}
                className="applications-small-button"
              >
                <FileText
                  size={13}
                />

                CV
              </Link>
            )}

            {application.coverLetter && (
              <Link
                href={`/cover-letter/${application.coverLetter.id}`}
                className="applications-small-button"
              >
                <Mail
                  size={13}
                />

                Lettre
              </Link>
            )}

            {application.status ===
              'APPROVED' &&
              applicationUrl && (
                <a
                  href={
                    applicationUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="applications-small-button"
                >
                  <ExternalLink
                    size={13}
                  />

                  Site de candidature
                </a>
              )}
          </div>

          {/* SCORE WARNING */}

          {application.status ===
            'READY_TO_VALIDATE' &&
            score !== null &&
            score <
              50 && (
              <div
                className="
                  mt-4
                  inline-flex
                  max-w-xl
                  items-start
                  gap-2
                  rounded-xl
                  border
                  border-amber-200
                  bg-amber-50
                  px-3 py-2.5
                  text-[10px]
                  leading-5
                  text-amber-700

                  dark:border-amber-400/15
                  dark:bg-amber-500/10
                  dark:text-amber-300
                "
              >
                <AlertTriangle
                  size={13}
                  className="mt-[2px] shrink-0"
                />

                <span>
                  Compatibilité de{' '}
                  <strong>
                    {score}%
                  </strong>
                  . Vérifiez le CV
                  et la lettre avant
                  de poursuivre.
                </span>
              </div>
            )}
        </div>

        {/* ==================================================== */}
        {/* ACTIONS */}
        {/* ==================================================== */}

        <aside className="application-actions-panel">

          <label
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-zinc-400
            "
          >
            Statut
          </label>

          <select
            value={
              application.status
            }
            disabled={
              updating
            }
            onChange={(
              event,
            ) => {
              const nextStatus =
                event.target
                  .value as ApplicationStatus;

              if (
                nextStatus ===
                  'SENT' &&
                application.status !==
                  'SENT'
              ) {
                alert(
                  'Utilise « Confirmer l’envoi » après avoir réellement envoyé la candidature.',
                );

                return;
              }

              void onStatusChange(
                application.id,
                nextStatus,
              );
            }}
            className="application-status-select"
          >
            {statusOptions.map(
              (
                status,
              ) => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {
                    STATUS_LABELS[
                      status
                    ]
                  }
                </option>
              ),
            )}
          </select>

          {updating && (
            <div
              className="
                mt-2
                flex items-center
                gap-2
                text-[9px]
                text-zinc-400
              "
            >
              <RefreshCw
                size={11}
                className="animate-spin"
              />

              Mise à jour...
            </div>
          )}

          {/* READY */}

          {application.status ===
            'READY_TO_VALIDATE' && (
            <button
              type="button"
              disabled={
                updating
              }
              onClick={() =>
                void onSend(
                  application,
                )
              }
              className="
                applications-primary-button
                mt-3 w-full
              "
            >
              <Send
                size={13}
              />

              Valider et postuler
            </button>
          )}

          {/* FAILED */}

          {application.status ===
            'FAILED' && (
            <button
              type="button"
              disabled={
                updating
              }
              onClick={() =>
                void onSend(
                  application,
                )
              }
              className="
                applications-danger-button
                mt-3 w-full
              "
            >
              Réessayer
            </button>
          )}

          {/* APPROVED */}

          {application.status ===
            'APPROVED' && (
            <>
              <div
                className="
                  mt-3
                  rounded-xl
                  border
                  border-blue-200
                  bg-blue-50
                  px-3 py-2.5
                  text-[9px]
                  leading-5
                  text-blue-700

                  dark:border-blue-400/15
                  dark:bg-blue-500/10
                  dark:text-blue-300
                "
              >
                Finalisez la candidature
                sur le site, puis confirmez
                l&apos;envoi.
              </div>

              <button
                type="button"
                disabled={
                  updating
                }
                onClick={() =>
                  void onStatusChange(
                    application.id,
                    'SENT',
                  )
                }
                className="
                  applications-success-button
                  mt-3 w-full
                "
              >
                Confirmer l&apos;envoi
              </button>
            </>
          )}

          {/* SENDING */}

          {application.status ===
            'SENDING' && (
            <div
              className="
                mt-3
                rounded-xl
                border
                border-violet-200
                bg-violet-50
                px-3 py-2.5
                text-[10px]
                text-violet-700

                dark:border-violet-400/15
                dark:bg-violet-500/10
                dark:text-violet-300
              "
            >
              Envoi en cours...
            </div>
          )}

          {/* SENT */}

          {application.status ===
            'SENT' && (
            <button
              type="button"
              disabled={
                updating
              }
              onClick={() =>
                void onStatusChange(
                  application.id,
                  'FOLLOW_UP',
                )
              }
              className="
                applications-secondary-button
                mt-3 w-full
              "
            >
              Marquer à relancer
            </button>
          )}

          <Link
            href={`/applications/${application.id}`}
            className="
              applications-ghost-link
              mt-2
            "
          >
            Ouvrir le suivi

            <ArrowUpRight
              size={12}
            />
          </Link>
        </aside>
      </div>
    </article>
  );
}

function Meta({
  icon: Icon,
  value,
}: {
  icon:
    typeof MapPin;

  value: string;
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        text-[9.5px]
        text-zinc-400

        dark:text-zinc-500
      "
    >
      <Icon
        size={11}
      />

      {value}
    </span>
  );
}