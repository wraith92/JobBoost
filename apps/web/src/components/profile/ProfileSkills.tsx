'use client';

import {
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

import type {
  Skill,
  SkillForm,
} from './profile.types';

export default function ProfileSkills({
  skills,

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
  skills:
    Skill[];

  form:
    SkillForm;

  setForm:
    React.Dispatch<
      React.SetStateAction<
        SkillForm
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
      skill:
        Skill,
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
            <Sparkles
              size={14}
              className="text-violet-500"
            />

            <h2 className="profile-section-title">
              Compétences
            </h2>
          </div>

          <p className="profile-section-description">
            Compétences utilisées
            directement par le moteur
            de matching.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(
              true,
            )
          }
          className="profile-secondary-button"
        >
          <Plus
            size={13}
          />

          Ajouter
        </button>
      </div>

      {showForm && (
        <div className="profile-form-panel">
          <div
            className="
              grid gap-3
              md:grid-cols-3
            "
          >
            <input
              value={
                form.name
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  name:
                    event.target
                      .value,
                })
              }
              placeholder="Compétence"
              className="profile-input"
            />

            <input
              value={
                form.category
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  category:
                    event.target
                      .value,
                })
              }
              placeholder="Catégorie"
              className="profile-input"
            />

            <select
              value={
                form.level
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  level:
                    event.target
                      .value,
                })
              }
              className="profile-input"
            >
              <option value="">
                Niveau
              </option>

              <option value="1">
                1 / 5
              </option>

              <option value="2">
                2 / 5
              </option>

              <option value="3">
                3 / 5
              </option>

              <option value="4">
                4 / 5
              </option>

              <option value="5">
                5 / 5
              </option>
            </select>
          </div>

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
                : 'Ajouter'}
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

      <div
        className="
          mt-5
          flex flex-wrap
          gap-2
        "
      >
        {skills.map(
          (
            skill,
          ) => (
            <div
              key={
                skill.id
              }
              className="profile-skill"
            >
              <div>
                <span
                  className="
                    font-semibold
                  "
                >
                  {
                    skill.name
                  }
                </span>

                {skill.category && (
                  <span
                    className="
                      ml-1.5
                      opacity-50
                    "
                  >
                    {
                      skill.category
                    }
                  </span>
                )}

                {skill.level && (
                  <span
                    className="
                      ml-1.5
                      text-violet-500
                    "
                  >
                    {
                      skill.level
                    }
                    /5
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  onEdit(
                    skill,
                  )
                }
                className="profile-skill-action"
              >
                <Pencil
                  size={10}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(
                    skill.id,
                  )
                }
                className="profile-skill-action profile-skill-delete"
              >
                <Trash2
                  size={10}
                />
              </button>
            </div>
          ),
        )}
      </div>
    </section>
  );
}