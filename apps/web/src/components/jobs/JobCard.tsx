'use client';
import {
  Banknote,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  useState,
} from 'react';
import {
  AnalysisBadge,
  ApplicationMethodBadge,
  ApplicationStatusBadge,
  ScoreBadge,
  SourceBadge,
} from './JobsBadges';
import PreparedApplicationPanel
  from './PreparedApplicationPanel';
import SkillsBlock
  from './SkillsBlock';
import {
  formatDate,
} from './jobs.utils';
import type {
  ActionFeedback,
  Job,
  PreparedApplication,
} from './jobs.types';
export default function JobCard({
  job,
  prepared,
  feedback,
  isAnalyzing,
  isPreparing,
  anyAnalyzing,
  anyPreparing,
  sending,
  confirming,
  isDeleting,
  isExiting,
  onAnalyze,
  onPrepare,
  onOpenDocuments,
  onSend,
  onConfirm,
  onReopen,
  onDelete,
}: {
  job: Job;
  prepared:
    | PreparedApplication
    | undefined;
  feedback:
    | ActionFeedback
    | null;
  isAnalyzing: boolean;
  isPreparing: boolean;
  anyAnalyzing: boolean;
  anyPreparing: boolean;
  sending: boolean;
  confirming: boolean;
  isDeleting: boolean;
  isExiting: boolean;
  onAnalyze:
    () => void;
  onPrepare:
    () => void;
  onOpenDocuments:
    () => void;
  onSend:
    () => void;
  onConfirm:
    () => void;
  onReopen:
    () => void;
  onDelete:
    () => void;
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);
  return (
    <article
      aria-hidden={
        isExiting
      }
      className={[
        'jobs-card transform-gpu transition-all duration-[380ms] ease-in-out will-change-transform',
        isExiting
          ? '-translate-y-8 translate-x-24 scale-[0.96] opacity-0 pointer-events-none'
          : 'translate-x-0 translate-y-0 scale-100 opacity-100',
      ].join(
        ' ',
      )}
    >
      <div
        className="
          flex flex-col
          gap-5
          xl:flex-row
          xl:items-start
          xl:justify-between
        "
      >
        <div className="min-w-0 flex-1">
          {/* BADGES */}
          <div
            className="
              flex flex-wrap
              items-center
              gap-1.5
            "
          >
            <SourceBadge
              source={
                job.source
              }
            />
            {job.contractType && (
              <span
                className="
                  jobs-badge
                  border-zinc-200
                  bg-zinc-50
                  text-zinc-500
                  dark:border-white/[0.07]
                  dark:bg-white/[0.04]
                  dark:text-zinc-400
                "
              >
                {
                  job.contractType
                }
              </span>
            )}
            {job.analysis && (
              <AnalysisBadge />
            )}
            {job.applicationMethod && (
              <ApplicationMethodBadge
                method={
                  job.applicationMethod
                }
              />
            )}
            {prepared && (
              <ApplicationStatusBadge
                status={
                  prepared.status
                }
              />
            )}
          </div>
          {/* TITLE */}
          <div
            className="
              mt-3
              flex flex-col
              gap-2
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <h2
                className="
                  text-[15px]
                  font-semibold
                  leading-6
                  tracking-[-0.015em]
                  text-zinc-950
                  dark:text-zinc-50
                "
              >
                {
                  job.title
                }
              </h2>
              <p
                className="
                  mt-1
                  max-w-2xl
                  truncate
                  text-[9px]
                  text-zinc-400
                "
              >
                Réf.{' '}
                {
                  job.externalId
                }
              </p>
            </div>
            {job.analysis && (
              <ScoreBadge
                score={
                  job.analysis
                    .score
                }
              />
            )}
          </div>
          {/* META */}
          <div
            className="
              mt-4
              flex flex-wrap
              gap-x-5
              gap-y-2
            "
          >
            {job.company && (
              <Meta
                icon={
                  Building2
                }
                value={
                  job.company
                }
              />
            )}
            {job.location && (
              <Meta
                icon={
                  MapPin
                }
                value={
                  job.location
                }
              />
            )}
            {job.sourceCreatedAt && (
              <Meta
                icon={
                  CalendarDays
                }
                value={
                  formatDate(
                    job.sourceCreatedAt,
                  )
                }
              />
            )}
            {job.salary && (
              <Meta
                icon={
                  Banknote
                }
                value={
                  job.salary
                }
              />
            )}
          </div>
          {/* DESCRIPTION */}
          {job.description && (
            <p
              className="
                mt-4
                line-clamp-2
                max-w-4xl
                text-[11px]
                leading-5
                text-zinc-500
                dark:text-zinc-400
              "
            >
              {
                job.description
              }
            </p>
          )}
        </div>
        {/* ACTIONS */}
        <div
          className="
            flex shrink-0
            flex-wrap
            items-center
            gap-2
            xl:max-w-[390px]
            xl:justify-end
          "
        >
          <button
            type="button"
            disabled={
              isAnalyzing ||
              isPreparing ||
              anyPreparing ||
              isDeleting
            }
            onClick={
              onAnalyze
            }
            className="jobs-small-button"
          >
            <RefreshCw
              size={13}
              className={
                isAnalyzing
                  ? 'animate-spin'
                  : ''
              }
            />
            {isAnalyzing
              ? 'Analyse...'
              : job.analysis
                ? 'Ré-analyser'
                : 'Analyser'}
          </button>
          {!prepared ? (
            <button
              type="button"
              disabled={
                isPreparing ||
                anyAnalyzing ||
                anyPreparing ||
                isDeleting
              }
              onClick={
                onPrepare
              }
              className="jobs-primary-small-button"
            >
              <Sparkles
                size={13}
              />
              {isPreparing
                ? 'Préparation...'
                : 'Préparer'}
            </button>
          ) : (
            <button
              type="button"
              onClick={
                onPrepare
              }
              className="jobs-success-small-button"
            >
              <Sparkles
                size={13}
              />
              Candidature prête
            </button>
          )}
          {job.url && (
            <a
              href={
                job.url
              }
              target="_blank"
              rel="noreferrer"
              className="jobs-small-button"
            >
              <ExternalLink
                size={13}
              />
              Offre
            </a>
          )}
          <button
            type="button"
            disabled={
              isDeleting
            }
            onClick={
              onDelete
            }
            className="
              jobs-small-button
              border-red-500/20
              text-red-500
              hover:border-red-500/30
              hover:bg-red-500/10
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:text-red-400
            "
          >
            <Trash2
              size={13}
            />
            {isDeleting
              ? 'Suppression...'
              : 'Supprimer'}
          </button>
          <button
            type="button"
            onClick={() =>
              setExpanded(
                !expanded,
              )
            }
            className="jobs-ghost-button"
          >
            {expanded
              ? 'Réduire'
              : 'Détails'}
            {expanded ? (
              <ChevronUp
                size={13}
              />
            ) : (
              <ChevronDown
                size={13}
              />
            )}
          </button>
        </div>
      </div>
      {/* DETAILS */}
      {expanded && (
        <div
          className="
            mt-5
            border-t
            border-zinc-100
            pt-5
            dark:border-white/[0.06]
          "
        >
          {job.analysis
            ?.summary && (
            <div
              className="
                rounded-[14px]
                border
                border-violet-100
                bg-violet-50/40
                p-4
                dark:border-violet-400/10
                dark:bg-violet-500/[0.04]
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-violet-600
                  dark:text-violet-300
                "
              >
                Synthèse IA
              </p>
              <p
                className="
                  mt-2
                  text-[11px]
                  leading-5
                  text-zinc-600
                  dark:text-zinc-300
                "
              >
                {
                  job.analysis
                    .summary
                }
              </p>
            </div>
          )}
          {job.analysis && (
            <div
              className="
                mt-5
                grid gap-5
                lg:grid-cols-2
              "
            >
              {job.analysis
                .requiredSkills
                .length >
                0 && (
                <SkillsBlock
                  title="Compétences demandées"
                  skills={
                    job.analysis
                      .requiredSkills
                  }
                  variant="neutral"
                />
              )}
              {job.analysis
                .matchedSkills
                .length >
                0 && (
                <SkillsBlock
                  title="Compétences correspondantes"
                  skills={
                    job.analysis
                      .matchedSkills
                  }
                  variant="success"
                />
              )}
              {job.analysis
                .missingSkills
                .length >
                0 && (
                <SkillsBlock
                  title="Compétences à renforcer"
                  skills={
                    job.analysis
                      .missingSkills
                  }
                  variant="danger"
                />
              )}
              {job.analysis
                .technologies
                .length >
                0 && (
                <SkillsBlock
                  title="Technologies détectées"
                  skills={
                    job.analysis
                      .technologies
                  }
                  variant="technology"
                />
              )}
            </div>
          )}
          {prepared && (
            <PreparedApplicationPanel
              job={
                job
              }
              prepared={
                prepared
              }
              feedback={
                feedback
              }
              sending={
                sending
              }
              confirming={
                confirming
              }
              onOpenDocuments={
                onOpenDocuments
              }
              onSend={
                onSend
              }
              onConfirm={
                onConfirm
              }
              onReopen={
                onReopen
              }
            />
          )}
        </div>
      )}
    </article>
  );
}
function Meta({
  icon: Icon,
  value,
}: {
  icon:
    typeof Building2;
  value: string;
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        text-[10px]
        text-zinc-400
        dark:text-zinc-500
      "
    >
      <Icon
        size={12}
      />
      {value}
    </span>
  );
}
