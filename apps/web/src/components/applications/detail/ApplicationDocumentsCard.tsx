import {
  ArrowUpRight,
  FileText,
  Mail,
} from 'lucide-react';

import Link from 'next/link';

import type {
  ApplicationDetail,
} from './application-detail.types';

export default function ApplicationDocumentsCard({
  application,
}: {
  application:
    ApplicationDetail;
}) {
  return (
    <section className="application-detail-card">
      <div>
        <h2 className="application-detail-title">
          Documents
        </h2>

        <p className="application-detail-description">
          Documents générés pour
          cette candidature.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {application.resume ? (
          <DocumentLink
            href={`/resume/${application.resume.id}`}
            icon={
              FileText
            }
            title="CV personnalisé"
            subtitle={
              application.resume
                .title
            }
          />
        ) : (
          <MissingDocument
            label="CV non disponible"
          />
        )}

        {application.coverLetter ? (
          <DocumentLink
            href={`/cover-letter/${application.coverLetter.id}`}
            icon={
              Mail
            }
            title="Lettre de motivation"
            subtitle={
              application
                .coverLetter
                .title
            }
          />
        ) : (
          <MissingDocument
            label="Lettre non disponible"
          />
        )}
      </div>
    </section>
  );
}

function DocumentLink({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;

  icon:
    typeof FileText;

  title: string;

  subtitle: string;
}) {
  return (
    <Link
      href={
        href
      }
      className="application-document-link"
    >
      <div
        className="
          flex h-9 w-9
          shrink-0
          items-center
          justify-center
          rounded-[10px]
          bg-violet-50
          text-violet-600

          dark:bg-violet-500/10
          dark:text-violet-300
        "
      >
        <Icon
          size={15}
        />
      </div>

      <div className="min-w-0 flex-1">
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
            mt-[2px]
            truncate
            text-[9px]
            text-zinc-400
          "
        >
          {subtitle}
        </p>
      </div>

      <ArrowUpRight
        size={13}
        className="text-zinc-400"
      />
    </Link>
  );
}

function MissingDocument({
  label,
}: {
  label: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-dashed
        border-zinc-200
        px-3 py-3
        text-[10px]
        text-zinc-400

        dark:border-white/[0.08]
      "
    >
      {label}
    </div>
  );
}