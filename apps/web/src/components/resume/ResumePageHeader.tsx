import {
  ArrowLeft,
  Download,
  FileText,
  Sparkles,
} from 'lucide-react';

import {
  API_URL,
} from './resume.constants';

import type {
  Resume,
} from './resume.types';

export default function ResumePageHeader({
  resume,
  generatingLetter,

  onBack,
  onGenerateLetter,
}: {
  resume: Resume;

  generatingLetter:
    boolean;

  onBack:
    () => void;

  onGenerateLetter:
    () => void;
}) {
  const target =
    resume.content
      .targetJob;

  return (
    <header>
      <button
        type="button"
        onClick={
          onBack
        }
        className="resume-back-button"
      >
        <ArrowLeft
          size={13}
        />

        Retour
      </button>

      <div
        className="
          mt-5
          flex flex-col
          gap-5

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              mb-2
              flex items-center
              gap-2
            "
          >
            <span
              className="
                flex h-6 w-6
                items-center
                justify-center
                rounded-lg
                bg-violet-100
                text-violet-600

                dark:bg-violet-500/10
                dark:text-violet-300
              "
            >
              <FileText
                size={13}
              />
            </span>

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-violet-600

                dark:text-violet-300
              "
            >
              CV personnalisé
            </span>
          </div>

          <h1
            className="
              text-[26px]
              font-semibold
              tracking-[-0.035em]
              text-zinc-950

              dark:text-zinc-50
            "
          >
            {target.title}
          </h1>

          <p
            className="
              mt-2
              text-[11px]
              text-zinc-500

              dark:text-zinc-400
            "
          >
            {target.company ??
              'Entreprise non renseignée'}

            {target.location
              ? ` · ${target.location}`
              : ''}
          </p>
        </div>

        <div
          className="
            flex flex-wrap
            items-center
            gap-2
          "
        >
          {target.compatibilityScore !==
            null && (
            <span className="resume-score-badge">
              {
                target.compatibilityScore
              }
              % match
            </span>
          )}

          <button
            type="button"
            disabled={
              generatingLetter
            }
            onClick={
              onGenerateLetter
            }
            className="resume-secondary-button"
          >
            <Sparkles
              size={13}
            />

            {generatingLetter
              ? 'Génération...'
              : 'Générer la lettre'}
          </button>

          <a
            href={`${API_URL}/resume/${resume.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="resume-primary-button"
          >
            <Download
              size={13}
            />

            PDF
          </a>
        </div>
      </div>
    </header>
  );
}