'use client';
import {
  Download,
  FileText,
  LoaderCircle,
  X,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import {
  API_URL,
} from './jobs.constants';
import {
  readErrorMessage,
} from './jobs.utils';
import type {
  DocumentTab,
} from './jobs.types';
export default function ApplicationDocumentsModal({
  open,
  jobTitle,
  applicationId,
  resumeId,
  coverLetterId,
  initialTab,
  onClose,
}: {
  open: boolean;
  jobTitle: string;
  applicationId: string | null;
  resumeId: string | null;
  coverLetterId: string | null;
  initialTab: DocumentTab;
  onClose: () => void;
}) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<DocumentTab>(
      initialTab,
    );
  const [
    loading,
    setLoading,
  ] = useState(false);
  const [
    error,
    setError,
  ] = useState('');
  const [
    preparingFiles,
    setPreparingFiles,
  ] = useState(false);
  const [
    filesMessage,
    setFilesMessage,
  ] = useState('');
  const [
    filesError,
    setFilesError,
  ] = useState('');
  const [
    resumeUrl,
    setResumeUrl,
  ] = useState<
    string | null
  >(
    null,
  );
  const [
    letterUrl,
    setLetterUrl,
  ] = useState<
    string | null
  >(
    null,
  );
  useEffect(() => {
    if (!open) {
      return;
    }
    let nextTab =
      initialTab;
    if (
      nextTab ===
        'resume' &&
      !resumeId &&
      coverLetterId
    ) {
      nextTab =
        'letter';
    }
    if (
      nextTab ===
        'letter' &&
      !coverLetterId &&
      resumeId
    ) {
      nextTab =
        'resume';
    }
    setActiveTab(
      nextTab,
    );
    setError(
      '',
    );
    setFilesMessage(
      '',
    );
    setFilesError(
      '',
    );
  }, [
    open,
    initialTab,
    resumeId,
    coverLetterId,
  ]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const controller =
      new AbortController();
    async function loadDocument() {
      try {
        setLoading(
          true,
        );
        setError(
          '',
        );
        const id =
          activeTab ===
          'resume'
            ? resumeId
            : coverLetterId;
        if (!id) {
          throw new Error(
            'Document indisponible.',
          );
        }
        if (
          activeTab ===
            'resume' &&
          resumeUrl
        ) {
          return;
        }
        if (
          activeTab ===
            'letter' &&
          letterUrl
        ) {
          return;
        }
        const endpoint =
          activeTab ===
          'resume'
            ? `${API_URL}/resume/${id}/pdf`
            : `${API_URL}/cover-letter/${id}/pdf`;
        const response =
          await fetch(
            endpoint,
            {
              cache:
                'no-store',
              signal:
                controller.signal,
            },
          );
        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              'Impossible de charger le document.',
            ),
          );
        }
        const blob =
          await response.blob();
        if (!blob.size) {
          throw new Error(
            'Le PDF est vide.',
          );
        }
        const pdf =
          new Blob(
            [
              blob,
            ],
            {
              type:
                'application/pdf',
            },
          );
        const url =
          URL.createObjectURL(
            pdf,
          );
        if (
          activeTab ===
          'resume'
        ) {
          setResumeUrl(
            url,
          );
        } else {
          setLetterUrl(
            url,
          );
        }
      } catch (
        currentError
      ) {
        if (
          currentError instanceof
            DOMException &&
          currentError.name ===
            'AbortError'
        ) {
          return;
        }
        setError(
          currentError instanceof
            Error
            ? currentError.message
            : 'Impossible de charger le document.',
        );
      } finally {
        setLoading(
          false,
        );
      }
    }
    void loadDocument();
    return () => {
      controller.abort();
    };
  }, [
    open,
    activeTab,
    resumeId,
    coverLetterId,
    resumeUrl,
    letterUrl,
  ]);
  useEffect(() => {
    if (open) {
      return;
    }
    if (resumeUrl) {
      URL.revokeObjectURL(
        resumeUrl,
      );
      setResumeUrl(
        null,
      );
    }
    if (letterUrl) {
      URL.revokeObjectURL(
        letterUrl,
      );
      setLetterUrl(
        null,
      );
    }
  }, [
    open,
    resumeUrl,
    letterUrl,
  ]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const previous =
      document.body.style
        .overflow;
    document.body.style.overflow =
      'hidden';
    function handleKeyDown(
      event:
        KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose();
      }
    }
    window.addEventListener(
      'keydown',
      handleKeyDown,
    );
    return () => {
      document.body.style.overflow =
        previous;
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);
  async function prepareApplicationFiles() {
    if (
      !applicationId ||
      preparingFiles
    ) {
      return;
    }
    try {
      setPreparingFiles(
        true,
      );
      setFilesMessage(
        '',
      );
      setFilesError(
        '',
      );
      const response =
        await fetch(
          `${API_URL}/applications/${applicationId}/prepare-files`,
          {
            method:
              'POST',
          },
        );
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'Impossible de préparer les fichiers.',
          ),
        );
      }
      const result =
        (await response.json()) as {
          success?: boolean;
          directory?: string;
        };
      if (
        result.success ===
        false
      ) {
        throw new Error(
          'La préparation des fichiers a échoué.',
        );
      }
      setFilesMessage(
        result.directory
          ? `CV et lettre prêts dans ${result.directory}`
          : 'CV et lettre prêts pour France Travail.',
      );
    } catch (
      currentError
    ) {
      setFilesError(
        currentError instanceof
          Error
          ? currentError.message
          : 'Impossible de préparer les fichiers.',
      );
    } finally {
      setPreparingFiles(
        false,
      );
    }
  }
  async function download(
    type:
      DocumentTab,
  ) {
    const id =
      type ===
      'resume'
        ? resumeId
        : coverLetterId;
    if (!id) {
      return;
    }
    try {
      const endpoint =
        type ===
        'resume'
          ? `${API_URL}/resume/${id}/pdf`
          : `${API_URL}/cover-letter/${id}/pdf`;
      const response =
        await fetch(
          endpoint,
          {
            cache:
              'no-store',
          },
        );
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'Téléchargement impossible.',
          ),
        );
      }
      const blob =
        await response.blob();
      const url =
        URL.createObjectURL(
          new Blob(
            [
              blob,
            ],
            {
              type:
                'application/pdf',
            },
          ),
        );
      const safeTitle =
        jobTitle
          .normalize(
            'NFD',
          )
          .replace(
            /[\u0300-\u036f]/g,
            '',
          )
          .replace(
            /[^a-zA-Z0-9_ -]/g,
            '',
          )
          .trim()
          .replace(
            /\s+/g,
            '_',
          )
          .slice(
            0,
            55,
          );
      const link =
        document.createElement(
          'a',
        );
      link.href =
        url;
      link.download =
        type ===
        'resume'
          ? `CV_${safeTitle}.pdf`
          : `Lettre_${safeTitle}.pdf`;
      document.body.appendChild(
        link,
      );
      link.click();
      link.remove();
      window.setTimeout(
        () =>
          URL.revokeObjectURL(
            url,
          ),
        1000,
      );
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof
          Error
          ? currentError.message
          : 'Téléchargement impossible.',
      );
    }
  }
  if (!open) {
    return null;
  }
  const currentUrl =
    activeTab ===
    'resume'
      ? resumeUrl
      : letterUrl;
  return (
    <div
      className="jobs-documents-backdrop"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="jobs-documents-panel">
        <header
          className="
            shrink-0
            border-b
            border-zinc-100
            px-5 py-4
            dark:border-white/[0.06]
          "
        >
          <div
            className="
              flex items-start
              justify-between
              gap-4
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
                  flex h-9 w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500
                  text-white
                "
              >
                <FileText
                  size={16}
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
                  "
                >
                  Documents
                </p>
                <h2
                  className="
                    mt-1
                    text-[15px]
                    font-semibold
                    text-zinc-900
                    dark:text-zinc-100
                  "
                >
                  Aperçu de la candidature
                </h2>
                <p
                  className="
                    mt-1
                    max-w-xl
                    truncate
                    text-[9px]
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
          <div
            className="
              mt-4
              inline-flex
              rounded-xl
              border
              border-zinc-200
              bg-zinc-50
              p-1
              dark:border-white/[0.07]
              dark:bg-white/[0.03]
            "
          >
            <Tab
              label="CV personnalisé"
              active={
                activeTab ===
                'resume'
              }
              disabled={
                !resumeId
              }
              onClick={() =>
                setActiveTab(
                  'resume',
                )
              }
            />
            <Tab
              label="Lettre de motivation"
              active={
                activeTab ===
                'letter'
              }
              disabled={
                !coverLetterId
              }
              onClick={() =>
                setActiveTab(
                  'letter',
                )
              }
            />
          </div>
        </header>
        <div className="jobs-pdf-area">
          {loading && (
            <div
              className="
                absolute inset-0
                z-10
                flex items-center
                justify-center
                bg-zinc-50
                dark:bg-[#100b15]
              "
            >
              <LoaderCircle
                size={28}
                className="
                  animate-spin
                  text-violet-500
                "
              />
            </div>
          )}
          {!loading &&
            error && (
            <div
              className="
                flex h-full
                items-center
                justify-center
                p-6
              "
            >
              <p
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  text-[11px]
                  text-red-700
                  dark:border-red-400/15
                  dark:bg-red-500/10
                  dark:text-red-300
                "
              >
                {error}
              </p>
            </div>
          )}
          {!loading &&
            !error &&
            currentUrl && (
            <iframe
              src={`${currentUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
              title={
                activeTab ===
                'resume'
                  ? 'CV'
                  : 'Lettre'
              }
              className="
                h-full
                w-full
                border-0
              "
            />
          )}
        </div>
        <footer
          className="
            flex shrink-0
            flex-wrap
            justify-end
            gap-2
            border-t
            border-zinc-100
            px-5 py-3
            dark:border-white/[0.06]
          "
        >
          {(filesMessage ||
            filesError) && (
            <p
              className={
                filesError
                  ? 'mr-auto self-center text-[10px] font-medium text-red-500'
                  : 'mr-auto self-center text-[10px] font-medium text-emerald-500'
              }
            >
              {filesError ||
                `✓ ${filesMessage}`}
            </p>
          )}
          {applicationId && (
            <button
              type="button"
              disabled={
                preparingFiles
              }
              onClick={() =>
                void prepareApplicationFiles()
              }
              className="jobs-small-button disabled:cursor-not-allowed disabled:opacity-50"
            >
              {preparingFiles ? (
                <LoaderCircle
                  size={13}
                  className="animate-spin"
                />
              ) : (
                <FileText
                  size={13}
                />
              )}
              {preparingFiles
                ? 'Préparation...'
                : 'Préparer pour France Travail'}
            </button>
          )}
          {resumeId && (
            <button
              type="button"
              onClick={() =>
                void download(
                  'resume',
                )
              }
              className="jobs-small-button"
            >
              <Download
                size={13}
              />
              Télécharger CV
            </button>
          )}
          {coverLetterId && (
            <button
              type="button"
              onClick={() =>
                void download(
                  'letter',
                )
              }
              className="jobs-small-button"
            >
              <Download
                size={13}
              />
              Télécharger lettre
            </button>
          )}
          <button
            type="button"
            onClick={
              onClose
            }
            className="jobs-primary-small-button"
          >
            Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}
function Tab({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`
        rounded-lg
        px-3 py-2
        text-[10px]
        font-semibold
        transition
        ${
          active
            ? `
              bg-violet-500
              text-white
              shadow-sm
            `
            : `
              text-zinc-500
              dark:text-zinc-400
            `
        }
        disabled:cursor-not-allowed
        disabled:opacity-30
      `}
    >
      {label}
    </button>
  );
}
