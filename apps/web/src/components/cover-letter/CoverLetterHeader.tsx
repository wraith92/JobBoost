import {
  ArrowLeft,
  Check,
  Clipboard,
  Download,
  FileCheck2,
  Send,
} from 'lucide-react';

import {
  API_URL,
} from './cover-letter.constants';

import type {
  CoverLetter,
} from './cover-letter.types';

export default function CoverLetterHeader({
  letter,

  copied,
  preparing,

  onBack,
  onCopy,
  onPrepare,
}: {
  letter:
    CoverLetter;

  copied:
    boolean;

  preparing:
    boolean;

  onBack:
    () => void;

  onCopy:
    () => void;

  onPrepare:
    () => void;
}) {
  return (
    <header>
      <button
        type="button"
        onClick={
          onBack
        }
        className="cover-letter-back"
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
              <FileCheck2
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
              Lettre personnalisée
            </span>
          </div>

          <h1
            className="
              max-w-3xl
              text-[26px]
              font-semibold
              tracking-[-0.035em]
              text-zinc-950

              dark:text-zinc-50
            "
          >
            Lettre de motivation
          </h1>

          <p
            className="
              mt-2
              text-[11px]
              text-zinc-500

              dark:text-zinc-400
            "
          >
            {letter.job?.title ??
              letter.title}

            {letter.job?.company
              ? ` · ${letter.job.company}`
              : ''}
          </p>
        </div>

        <div
          className="
            flex flex-wrap
            gap-2
          "
        >
          <button
            type="button"
            onClick={
              onCopy
            }
            className="cover-letter-secondary-button"
          >
            {copied ? (
              <Check
                size={13}
              />
            ) : (
              <Clipboard
                size={13}
              />
            )}

            {copied
              ? 'Copiée'
              : 'Copier'}
          </button>

          <a
            href={`${API_URL}/cover-letter/${letter.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="cover-letter-secondary-button"
          >
            <Download
              size={13}
            />

            PDF
          </a>

          <button
            type="button"
            disabled={
              preparing
            }
            onClick={
              onPrepare
            }
            className="cover-letter-primary-button"
          >
            <Send
              size={13}
            />

            {preparing
              ? 'Préparation...'
              : 'Créer la candidature'}
          </button>
        </div>
      </div>
    </header>
  );
}