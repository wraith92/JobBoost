'use client';

import {
  ArrowUpRight,
  Code2,
  Layers3,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

import type {
  Project,
  ProjectForm,
} from './profile.types';

import {
  formatPeriod,
  normalizeUrl,
} from './profile.utils';

export default function ProfileProjects({
  projects,

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
  projects:
    Project[];

  form:
    ProjectForm;

  setForm:
    React.Dispatch<
      React.SetStateAction<
        ProjectForm
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
      project:
        Project,
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
            <Layers3
              size={14}
              className="text-violet-500"
            />

            <h2 className="profile-section-title">
              Projets
            </h2>
          </div>

          <p className="profile-section-description">
            Projets techniques
            exploitables dans les CV.
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
            placeholder="Nom du projet"
            className="profile-input"
          />

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
              form.technologies
            }
            onChange={(
              event,
            ) =>
              setForm({
                ...form,

                technologies:
                  event.target
                    .value,
              })
            }
            placeholder={"Une technologie par ligne\nNext.js\nNestJS\nPostgreSQL"}
            className="
              profile-input
              mt-3
              resize-y
            "
          />

          <div
            className="
              mt-3
              grid gap-3
              md:grid-cols-2
            "
          >
            <input
              value={
                form.url
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  url:
                    event.target
                      .value,
                })
              }
              placeholder="URL projet"
              className="profile-input"
            />

            <input
              value={
                form.githubUrl
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  githubUrl:
                    event.target
                      .value,
                })
              }
              placeholder="URL GitHub"
              className="profile-input"
            />

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

      <div
        className="
          mt-5
          grid gap-3
          md:grid-cols-2
        "
      >
        {projects.map(
          (
            project,
          ) => (
            <article
              key={
                project.id
              }
              className="profile-project"
            >
              <div
                className="
                  flex items-start
                  justify-between
                  gap-3
                "
              >
                <div>
                  <h3 className="profile-item-title">
                    {
                      project.name
                    }
                  </h3>

                  <p className="profile-item-meta">
                    {formatPeriod(
                      project.startDate,
                      project.endDate,
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
                        project,
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
                        project.id,
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

              {project.description && (
                <p className="profile-item-description">
                  {
                    project.description
                  }
                </p>
              )}

              <div
                className="
                  mt-3
                  flex flex-wrap
                  gap-1.5
                "
              >
                {project.technologies.map(
                  (
                    technology,
                  ) => (
                    <span
                      key={
                        technology
                      }
                      className="profile-tech"
                    >
                      {
                        technology
                      }
                    </span>
                  ),
                )}
              </div>

              {(project.url ||
                project.githubUrl) && (
                <div
                  className="
                    mt-4
                    flex gap-2
                  "
                >
                  {project.url && (
                    <a
                      href={
                        normalizeUrl(
                          project.url,
                        ) ??
                        '#'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="profile-project-link"
                    >
                      <ArrowUpRight
                        size={11}
                      />

                      Projet
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={
                        normalizeUrl(
                          project.githubUrl,
                        ) ??
                        '#'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="profile-project-link"
                    >
                      <Code2
                        size={11}
                      />

                      GitHub
                    </a>
                  )}
                </div>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}