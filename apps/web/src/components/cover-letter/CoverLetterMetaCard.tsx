import {
  BriefcaseBusiness,
  FileText,
  MapPin,
  Target,
} from 'lucide-react';

import type {
  CoverLetter,
} from './cover-letter.types';

import {
  formatDate,
} from './cover-letter.utils';

export default function CoverLetterMetaCard({
  letter,
}: {
  letter:
    CoverLetter;
}) {
  const score =
    letter.job
      ?.analysis?.score ??
    null;

  return (
    <aside className="cover-letter-meta-card">
      <div>
        <h2 className="cover-letter-section-title">
          Détails
        </h2>

        <p className="cover-letter-section-description">
          Informations liées au document.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <Meta
          icon={
            BriefcaseBusiness
          }
          label="Poste"
          value={
            letter.job?.title ??
            'Non renseigné'
          }
        />

        <Meta
          icon={
            BriefcaseBusiness
          }
          label="Entreprise"
          value={
            letter.job?.company ??
            'Non renseignée'
          }
        />

        {letter.job?.location && (
          <Meta
            icon={
              MapPin
            }
            label="Localisation"
            value={
              letter.job.location
            }
          />
        )}

        <Meta
          icon={
            Target
          }
          label="Compatibilité"
          value={
            score !== null
              ? `${score}%`
              : 'Non disponible'
          }
        />

        <Meta
          icon={
            FileText
          }
          label="Statut"
          value={
            letter.status
          }
        />

        {letter.createdAt && (
          <Meta
            icon={
              FileText
            }
            label="Créée le"
            value={
              formatDate(
                letter.createdAt,
              ) ??
              ''
            }
          />
        )}
      </div>
    </aside>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof FileText;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="cover-letter-meta-row">
      <div
        className="
          flex h-8 w-8
          shrink-0
          items-center
          justify-center
          rounded-[9px]
          bg-violet-50
          text-violet-600

          dark:bg-violet-500/10
          dark:text-violet-300
        "
      >
        <Icon
          size={13}
        />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[9px]
            uppercase
            tracking-[0.08em]
            text-zinc-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            truncate
            text-[10px]
            font-medium
            text-zinc-700

            dark:text-zinc-300
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}