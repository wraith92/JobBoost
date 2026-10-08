import {
  CalendarClock,
  Save,
} from 'lucide-react';

import type {
  SaveFeedback,
} from './application-detail.types';

export default function ApplicationTrackingForm({
  channel,
  notes,
  followUpAt,

  saving,
  isDirty,
  feedback,

  onChannelChange,
  onNotesChange,
  onFollowUpChange,

  onSave,
}: {
  channel: string;

  notes: string;

  followUpAt: string;

  saving: boolean;

  isDirty: boolean;

  feedback:
    SaveFeedback | null;

  onChannelChange:
    (
      value: string,
    ) => void;

  onNotesChange:
    (
      value: string,
    ) => void;

  onFollowUpChange:
    (
      value: string,
    ) => void;

  onSave:
    () => void;
}) {
  return (
    <section className="application-detail-card">
      <div
        className="
          flex items-start
          justify-between
          gap-4
        "
      >
        <div>
          <h2 className="application-detail-title">
            Suivi personnel
          </h2>

          <p className="application-detail-description">
            Ajoutez vos notes et
            planifiez les prochaines
            actions.
          </p>
        </div>

        {isDirty && (
          <span
            className="
              rounded-full
              bg-amber-50
              px-2.5 py-1
              text-[9px]
              font-semibold
              text-amber-700

              dark:bg-amber-500/10
              dark:text-amber-300
            "
          >
            Modifications non sauvegardées
          </span>
        )}
      </div>

      <div
        className="
          mt-5
          grid gap-4
          sm:grid-cols-2
        "
      >
        <div>
          <label className="application-detail-label">
            Canal de candidature
          </label>

          <select
            value={
              channel
            }
            onChange={(
              event,
            ) =>
              onChannelChange(
                event.target
                  .value,
              )
            }
            className="application-detail-input"
          >
            <option value="">
              Non renseigné
            </option>

            <option value="MANUAL">
              Manuel
            </option>

            <option value="FRANCE_TRAVAIL">
              France Travail
            </option>

            <option value="LINKEDIN">
              LinkedIn
            </option>

            <option value="INDEED">
              Indeed
            </option>

            <option value="HELLOWORK">
              HelloWork
            </option>

            <option value="WTTJ">
              Welcome to the Jungle
            </option>

            <option value="FREE_WORK">
              Free-Work
            </option>

            <option value="EMAIL">
              Email
            </option>
          </select>
        </div>

        <div>
          <label className="application-detail-label">
            Prochaine relance
          </label>

          <div className="relative">
            <CalendarClock
              size={14}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-zinc-400
              "
            />

            <input
                type="datetime-local"
                value={followUpAt}
                onChange={(event) =>
                    onFollowUpChange(
                    event.target.value,
                    )
                }
                className="
                    application-detail-input
                    application-detail-date-input
                "
                />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="application-detail-label">
          Notes
        </label>

        <textarea
          value={
            notes
          }
          onChange={(
            event,
          ) =>
            onNotesChange(
              event.target
                .value,
            )
          }
          rows={6}
          className="application-detail-input resize-y"
          placeholder="Contact recruteur, retour obtenu, salaire, prochaine action..."
        />
      </div>

      {feedback && (
        <div
          className={`
            mt-4
            rounded-xl
            border
            px-3 py-2.5
            text-[10px]

            ${
              feedback.type ===
              'success'
                ? `
                  border-emerald-200
                  bg-emerald-50
                  text-emerald-700

                  dark:border-emerald-400/15
                  dark:bg-emerald-500/10
                  dark:text-emerald-300
                `
                : `
                  border-red-200
                  bg-red-50
                  text-red-700

                  dark:border-red-400/15
                  dark:bg-red-500/10
                  dark:text-red-300
                `
            }
          `}
        >
          {
            feedback.message
          }
        </div>
      )}

      <div className="mt-5">
        <button
          type="button"
          onClick={
            onSave
          }
          disabled={
            saving ||
            !isDirty
          }
          className="application-detail-primary-button"
        >
          <Save
            size={13}
          />

          {saving
            ? 'Sauvegarde...'
            : 'Sauvegarder'}
        </button>
      </div>
    </section>
  );
}