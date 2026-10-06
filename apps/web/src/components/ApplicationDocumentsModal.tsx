'use client';

import {
  useEffect,
  useState,
} from 'react';

const API_URL =
  'http://localhost:3001';

export type DocumentTab =
  | 'resume'
  | 'letter';

type Props = {
  open: boolean;

  jobTitle: string;

  resumeId:
    | string
    | null;

  coverLetterId:
    | string
    | null;

  initialTab?:
    DocumentTab;

  onClose: () => void;
};

export default function ApplicationDocumentsModal({
  open,
  jobTitle,
  resumeId,
  coverLetterId,
  initialTab = 'resume',
  onClose,
}: Props) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<DocumentTab>(
      initialTab,
    );

  const [
    loadingDocument,
    setLoadingDocument,
  ] =
    useState(true);

  // ============================================================
  // RESET TAB
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab(
      initialTab,
    );

    setLoadingDocument(
      true,
    );
  }, [
    open,
    initialTab,
  ]);

  // ============================================================
  // LOCK BODY + ESC
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    function handleKeyDown(
      event: KeyboardEvent,
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
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  // ============================================================
  // DOCUMENT
  // ============================================================

  const documentId =
    activeTab ===
    'resume'
      ? resumeId
      : coverLetterId;

  const documentUrl =
    documentId
      ? activeTab ===
        'resume'
        ? `${API_URL}/resume/${documentId}/pdf`
        : `${API_URL}/cover-letter/${documentId}/pdf`
      : null;

  function selectTab(
    tab: DocumentTab,
  ) {
    if (
      tab === activeTab
    ) {
      return;
    }

    setLoadingDocument(
      true,
    );

    setActiveTab(
      tab,
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/70 p-3 backdrop-blur-sm md:p-6"
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
      <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        {/* ======================================================
            HEADER
           ====================================================== */}

        <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-4 md:px-7">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-white">
                  <DocumentIcon />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    JobBoost AI
                  </p>

                  <h2 className="text-lg font-bold text-gray-950 md:text-xl">
                    Aperçu des
                    documents
                  </h2>
                </div>
              </div>

              <p className="mt-3 max-w-3xl truncate text-sm text-gray-500">
                {jobTitle}
              </p>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          {/* ====================================================
              TABS
             ==================================================== */}

          <div className="mt-5 flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              disabled={
                !resumeId
              }
              onClick={() =>
                selectTab(
                  'resume',
                )
              }
              className={[
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition',

                activeTab ===
                'resume'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',

                !resumeId
                  ? 'cursor-not-allowed opacity-40'
                  : '',
              ].join(' ')}
            >
              CV personnalisé
            </button>

            <button
              type="button"
              disabled={
                !coverLetterId
              }
              onClick={() =>
                selectTab(
                  'letter',
                )
              }
              className={[
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition',

                activeTab ===
                'letter'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',

                !coverLetterId
                  ? 'cursor-not-allowed opacity-40'
                  : '',
              ].join(' ')}
            >
              Lettre de
              motivation
            </button>
          </div>
        </div>

        {/* ======================================================
            DOCUMENT AREA
           ====================================================== */}

        <div className="relative min-h-0 flex-1 bg-gray-100">
          {!documentUrl ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <DocumentIcon />
                </div>

                <p className="mt-4 font-semibold text-gray-900">
                  Document non
                  disponible
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Aucun document
                  n&apos;est associé
                  à cette
                  candidature.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* LOADING */}

              {loadingDocument && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                  <div className="rounded-2xl border border-gray-200 bg-white px-10 py-8 text-center shadow-sm">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-950" />

                    <p className="mt-4 text-sm font-semibold text-gray-900">
                      Chargement du{' '}
                      {activeTab ===
                      'resume'
                        ? 'CV'
                        : 'document'}
                      ...
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Préparation de
                      l&apos;aperçu
                    </p>
                  </div>
                </div>
              )}

              <iframe
                key={
                  documentUrl
                }
                src={
                  documentUrl
                }
                title={
                  activeTab ===
                  'resume'
                    ? 'CV personnalisé'
                    : 'Lettre de motivation'
                }
                onLoad={() =>
                  setLoadingDocument(
                    false,
                  )
                }
                className="h-full w-full border-0 bg-gray-100"
              />
            </>
          )}
        </div>

        {/* ======================================================
            FOOTER
           ====================================================== */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
          <p className="text-xs text-gray-400">
            Tu peux passer du CV
            à la lettre sans quitter
            cette offre.
          </p>

          <div className="flex gap-2">
            {documentUrl && (
              <a
                href={
                  documentUrl
                }
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Ouvrir le PDF
              </a>
            )}

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ICON
// ============================================================

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M7 3h7l4 4v14H7V3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14 3v5h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 13h5M10 17h5"
        strokeLinecap="round"
      />
    </svg>
  );
}