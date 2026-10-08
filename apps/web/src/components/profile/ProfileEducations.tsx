'use client';

import {
  GraduationCap,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

import type {
  Education,
  EducationForm,
} from './profile.types';

import {
  formatPeriod,
} from './profile.utils';

export default function ProfileEducations({
  educations,

  form,
  setForm,

  showForm,
  setShowForm,

  editingId,

  onSave,
  onEdit,
  onDelete,
  onCancel,
}: {
  educations:
    Education[];

  form:
    EducationForm;

  setForm:
    React.Dispatch<
      React.SetStateAction<
        EducationForm
      >
    >;

  showForm:
    boolean;

  setShowForm:
    (
      value: boolean,
    ) => void;

  editingId:
    string | null;

  onSave:
    () => void;

  onEdit:
    (
      education:
        Education,
    ) => void;

  onDelete:
    (
      id: string,
    ) => void;

  onCancel:
    () => void;
}) {
  return (
    <section className="profile-card">
      <Header
        onAdd={() =>
          setShowForm(
            true,
          )
        }
      />

      {showForm && (
        <div className="profile-form-panel">
          <div
            className="
              grid gap-3
              md:grid-cols-2
            "
          >
            <Input
              value={
                form.school
              }
              placeholder="École"
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  school:
                    value,
                })
              }
            />

            <Input
              value={
                form.degree
              }
              placeholder="Diplôme"
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  degree:
                    value,
                })
              }
            />

            <Input
              value={
                form.field
              }
              placeholder="Spécialité"
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  field:
                    value,
                })
              }
            />

            <div />

            <input
              type="date"
              value={
                form.startDate
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  startDate:
                    event.target
                      .value,
                })
              }
              className="profile-input"
            />

            <input
              type="date"
              value={
                form.endDate
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  endDate:
                    event.target
                      .value,
                })
              }
              className="profile-input"
            />
          </div>

          <textarea
            rows={4}
            value={
              form.description
            }
            onChange={(
              event,
            ) =>
              setForm({
                ...form,

                description:
                  event.target
                    .value,
              })
            }
            placeholder="Description de la formation"
            className="
              profile-input
              mt-3
              resize-y
            "
          />

          <div
            className="
              mt-4
              flex gap-2
            "
          >
            <button
              type="button"
              onClick={
                onSave
              }
              className="profile-primary-button"
            >
              <Save
                size={13}
              />

              {editingId
                ? 'Mettre à jour'
                : 'Enregistrer'}
            </button>

            <button
              type="button"
              onClick={
                onCancel
              }
              className="profile-secondary-button"
            >
              <X
                size={13}
              />

              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="profile-list">
        {educations.map(
          (
            education,
          ) => (
            <article
              key={
                education.id
              }
              className="profile-list-item"
            >
              <div
                className="
                  flex items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <h3 className="profile-item-title">
                    {
                      education.degree
                    }
                  </h3>

                  <p className="profile-item-accent">
                    {
                      education.school
                    }
                  </p>

                  <p className="profile-item-meta">
                    {education.field ??
                      ''}

                    {education.field
                      ? ' · '
                      : ''}

                    {formatPeriod(
                      education.startDate,
                      education.endDate,
                    )}
                  </p>
                </div>

                <div
                  className="
                    flex gap-1
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(
                        education,
                      )
                    }
                    className="profile-icon-button"
                  >
                    <Pencil
                      size={12}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDelete(
                        education.id,
                      )
                    }
                    className="profile-delete-button"
                  >
                    <Trash2
                      size={12}
                    />
                  </button>
                </div>
              </div>

              {education.description && (
                <p className="profile-item-description">
                  {
                    education.description
                  }
                </p>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}

function Header({
  onAdd,
}: {
  onAdd:
    () => void;
}) {
  return (
    <div
      className="
        flex items-start
        justify-between
        gap-4
      "
    >
      <div>
        <div
          className="
            flex items-center
            gap-2
          "
        >
          <GraduationCap
            size={14}
            className="text-violet-500"
          />

          <h2 className="profile-section-title">
            Formations
          </h2>
        </div>

        <p className="profile-section-description">
          Diplômes et parcours académique.
        </p>
      </div>

      <button
        type="button"
        onClick={
          onAdd
        }
        className="profile-secondary-button"
      >
        <Plus
          size={13}
        />

        Ajouter
      </button>
    </div>
  );
}

function Input({
  value,
  placeholder,
  onChange,
}: {
  value:
    string;

  placeholder:
    string;

  onChange:
    (
      value: string,
    ) => void;
}) {
  return (
    <input
      value={
        value
      }
      placeholder={
        placeholder
      }
      onChange={(
        event,
      ) =>
        onChange(
          event.target
            .value,
        )
      }
      className="profile-input"
    />
  );
}