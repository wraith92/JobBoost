import {
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import FeedbackBox
  from './FeedbackBox';
import {
  ApplicationStatusBadge,
} from './JobsBadges';
import type {
  ActionFeedback,
  Job,
  PreparedApplication,
} from './jobs.types';
export default function PreparedApplicationPanel({
  job,
  prepared,
  feedback,
  sending,
  confirming,
  onOpenDocuments,
  onSend,
  onConfirm,
  onReopen,
}: {
  job: Job;
  prepared:
    PreparedApplication;
  feedback:
    | ActionFeedback
    | null;
  sending: boolean;
  confirming: boolean;
  onOpenDocuments:
    () => void;
  onSend:
    () => void;
  onConfirm:
    () => void;
  onReopen:
    () => void;
}) {
  return (
    <section className="jobs-prepared-panel">
      <div
        className="
          flex flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div
          className="
            flex items-start
            gap-3
          "
        >
          <div
            className="
              flex h-9 w-9
              shrink-0
              items-center
              justify-center
              rounded-[11px]
              bg-emerald-500
              text-white
              shadow-[0_6px_18px_rgba(16,185,129,.18)]
            "
          >
            <Check
              size={17}
            />
          </div>
          <div>
            <div
              className="
                flex flex-wrap
                items-center
                gap-2
              "
            >
              <h3
                className="
                  text-[12px]
                  font-semibold
                  text-zinc-900
                  dark:text-zinc-100
                "
              >
                Candidature préparée
              </h3>
              <ApplicationStatusBadge
                status={
                  prepared.status
                }
              />
            </div>
            <p
              className="
                mt-1
                text-[10px]
                leading-5
                text-zinc-500
                dark:text-zinc-400
              "
            >
              CV et lettre générés.
              Vérifiez les documents
              avant l&apos;envoi.
            </p>
          </div>
        </div>
      </div>
      <div
        className="
          mt-4
          grid gap-2
          sm:grid-cols-2
        "
      >
        <DocumentCard
          icon={
            FileText
          }
          title="CV personnalisé"
          available={
            Boolean(
              prepared.resumeId,
            )
          }
        />
        <DocumentCard
          icon={
            Mail
          }
          title="Lettre de motivation"
          available={
            Boolean(
              prepared.coverLetterId,
            )
          }
        />
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
          mt-4
          flex flex-wrap
          gap-2
        "
      >
        <button
          type="button"
          onClick={
            onOpenDocuments
          }
          className="jobs-small-button"
        >
          <Eye
            size={13}
          />
          Aperçu documents
        </button>
        {(prepared.status ===
          'READY_TO_VALIDATE' ||
          prepared.status ===
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
              : 'Postuler'}
          </button>
        )}
        {prepared.status ===
          'APPROVED' && (
          <>
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
              <CheckCircle2
                size={13}
              />
              {confirming
                ? 'Validation...'
                : 'Valider l’envoi'}
            </button>
            {(job.applicationUrl ||
              job.url) && (
              <button
                type="button"
                onClick={
                  onReopen
                }
                className="jobs-small-button"
              >
                <ExternalLink
                  size={13}
                />
                Rouvrir le site
              </button>
            )}
          </>
        )}
        {prepared.status ===
          'SENT' && (
          <span
            className="
              inline-flex
              min-h-9
              items-center
              gap-1.5
              rounded-lg
              border
              border-emerald-200
              bg-emerald-50
              px-3
              text-[10px]
              font-semibold
              text-emerald-700
              dark:border-emerald-400/15
              dark:bg-emerald-500/10
              dark:text-emerald-300
            "
          >
            <CheckCircle2
              size={13}
            />
            Candidature envoyée
          </span>
        )}
        <Link
          href={`/applications/${prepared.applicationId}`}
          className="jobs-small-button"
        >
          Voir le suivi
        </Link>
      </div>
    </section>
  );
}
function DocumentCard({
  icon: Icon,
  title,
  available,
}: {
  icon:
    typeof FileText;
  title: string;
  available: boolean;
}) {
  return (
    <div className="jobs-document-ready">
      <div
        className={`
          flex h-8 w-8
          items-center
          justify-center
          rounded-lg
          ${
            available
              ? `
                bg-emerald-100
                text-emerald-700
                dark:bg-emerald-500/10
                dark:text-emerald-300
              `
              : `
                bg-zinc-100
                text-zinc-400
                dark:bg-white/[0.05]
              `
          }
        `}
      >
        <Icon
          size={14}
        />
      </div>
      <div>
        <p
          className="
            text-[10px]
            font-semibold
            text-zinc-800
            dark:text-zinc-200
          "
        >
          {title}
        </p>
        <p
          className="
            mt-[1px]
            text-[9px]
            text-zinc-400
          "
        >
          {available
            ? 'Document prêt'
            : 'Indisponible'}
        </p>
      </div>
    </div>
  );
}
