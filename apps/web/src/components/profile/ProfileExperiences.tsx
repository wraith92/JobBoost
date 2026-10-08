'use client';

import {
  BriefcaseBusiness,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

import type {
  Experience,
  ExperienceForm,
} from './profile.types';

import {
  formatPeriod,
} from './profile.utils';

export default function ProfileExperiences({
  experiences,

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
  experiences:
    Experience[];

  form:
    ExperienceForm;

  setForm:
    React.Dispatch<
      React.SetStateAction<
        ExperienceForm
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
      experience:
        Experience,
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
      <SectionHeader
        icon={
          BriefcaseBusiness
        }
        title="Expériences"
        description="Parcours professionnel utilisé pour le matching et la génération des CV."
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
                form.company
              }
              placeholder="Entreprise"
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  company:
                    value,
                })
              }
            />

            <Input
              value={
                form.title
              }
              placeholder="Poste"
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  title:
                    value,
                })
              }
            />

            <Input
              value={
                form.location
              }
              placeholder="Localisation"
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  location:
                    value,
                })
              }
            />

            <div
              className="
                flex items-center
                gap-2
                rounded-[10px]
                border
                border-zinc-200
                px-3

                dark:border-[#382842]
              "
            >
              <input
                type="checkbox"
                checked={
                  form.current
                }
                onChange={(
                  event,
                ) =>
                  setForm({
                    ...form,

                    current:
                      event.target
                        .checked,

                    endDate:
                      event.target
                        .checked
                        ? ''
                        : form.endDate,
                  })
                }
              />

              <span
                className="
                  text-[10px]
                  text-zinc-600

                  dark:text-zinc-300
                "
              >
                Poste actuel
              </span>
            </div>

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
              disabled={
                form.current
              }
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
            placeholder="Description"
            className="
              profile-input
              mt-3
              resize-y
            "
          />

          <textarea
            rows={5}
            value={
              form.bullets
            }
            onChange={(
              event,
            ) =>
              setForm({
                ...form,

                bullets:
                  event.target
                    .value,
              })
            }
            placeholder={"Une mission par ligne\nArchitecture NestJS\nAPI REST\nAzure"}
            className="
              profile-input
              mt-3
              resize-y
            "
          />

          <FormActions
            editing={
              Boolean(
                editingId,
              )
            }
            onSave={
              onSave
            }
            onCancel={
              onCancel
            }
          />
        </div>
      )}

      <div className="profile-list">
        {experiences.map(
          (
            experience,
          ) => (
            <article
              key={
                experience.id
              }
              className="profile-list-item"
            >
              <div
                className="
                  flex flex-col
                  gap-3
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >
                <div>
                  <h3 className="profile-item-title">
                    {
                      experience.title
                    }
                  </h3>

                  <p className="profile-item-accent">
                    {
                      experience.company
                    }
                  </p>

                  <p className="profile-item-meta">
                    {formatPeriod(
                      experience.startDate,
                      experience.endDate,
                      experience.current,
                    )}

                    {experience.location
                      ? ` · ${experience.location}`
                      : ''}
                  </p>
                </div>

                <RowActions
                  onEdit={() =>
                    onEdit(
                      experience,
                    )
                  }
                  onDelete={() =>
                    onDelete(
                      experience.id,
                    )
                  }
                />
              </div>

              {experience.description && (
                <p className="profile-item-description">
                  {
                    experience.description
                  }
                </p>
              )}

              {experience.bullets.length >
                0 && (
                <ul className="profile-bullet-list">
                  {experience.bullets.map(
                    (
                      bullet,
                      index,
                    ) => (
                      <li
                        key={
                          `${experience.id}-${index}`
                        }
                      >
                        {bullet}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  onAdd,
}: {
  icon:
    typeof BriefcaseBusiness;

  title:
    string;

  description:
    string;

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
          <Icon
            size={14}
            className="text-violet-500"
          />

          <h2 className="profile-section-title">
            {title}
          </h2>
        </div>

        <p className="profile-section-description">
          {description}
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

function FormActions({
  editing,
  onSave,
  onCancel,
}: {
  editing:
    boolean;

  onSave:
    () => void;

  onCancel:
    () => void;
}) {
  return (
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

        {editing
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
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit:
    () => void;

  onDelete:
    () => void;
}) {
  return (
    <div
      className="
        flex shrink-0
        gap-1
      "
    >
      <button
        type="button"
        onClick={
          onEdit
        }
        className="profile-icon-button"
      >
        <Pencil
          size={12}
        />
      </button>

      <button
        type="button"
        onClick={
          onDelete
        }
        className="profile-delete-button"
      >
        <Trash2
          size={12}
        />
      </button>
    </div>
  );
}