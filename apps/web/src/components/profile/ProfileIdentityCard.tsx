'use client';

import {
  Code2,
  Globe2,
  Mail,
  MapPin,
  Network,
  Pencil,
  Phone,
  Save,
  Target,
  X,
} from 'lucide-react';

import type {
  Profile,
  ProfileForm,
} from './profile.types';

import {
  normalizeUrl,
} from './profile.utils';

export default function ProfileIdentityCard({
  profile,

  form,
  setForm,

  editing,
  setEditing,

  onSave,
}: {
  profile:
    Profile;

  form:
    ProfileForm;

  setForm:
    React.Dispatch<
      React.SetStateAction<
        ProfileForm
      >
    >;

  editing:
    boolean;

  setEditing:
    (
      value: boolean,
    ) => void;

  onSave:
    () => void;
}) {
  // ============================================================
  // EDIT MODE
  // ============================================================

  if (
    editing
  ) {
    return (
      <section className="profile-card">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div
          className="
            flex items-center
            justify-between
          "
        >
          <div>
            <h2 className="profile-section-title">
              Informations personnelles
            </h2>

            <p className="profile-section-description">
              Ces données alimentent
              les CV et lettres générés.
            </p>
          </div>
        </div>

        {/* ======================================================
            BASIC INFORMATION
            ====================================================== */}

        <div
          className="
            mt-5
            grid gap-3
            md:grid-cols-2
          "
        >
          <ProfileInput
            placeholder="Prénom"
            value={
              form.firstName
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                firstName:
                  value,
              })
            }
          />

          <ProfileInput
            placeholder="Nom"
            value={
              form.lastName
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                lastName:
                  value,
              })
            }
          />

          <ProfileInput
            placeholder="Email"
            value={
              form.email
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                email:
                  value,
              })
            }
          />

          <ProfileInput
            placeholder="Téléphone"
            value={
              form.phone
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                phone:
                  value,
              })
            }
          />

          <ProfileInput
            placeholder="Localisation"
            value={
              form.location
            }
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

          <ProfileInput
            placeholder="Titre professionnel général"
            value={
              form.headline
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                headline:
                  value,
              })
            }
          />

          {/* ====================================================
              TARGET ROLES
              ==================================================== */}

          <div
            className="
              md:col-span-2
            "
          >
            <div
              className="
                mb-2
                flex items-center
                gap-2
              "
            >
              <Target
                size={13}
                className="
                  text-violet-500
                "
              />

              <label
                className="
                  text-[10px]
                  font-semibold
                  text-zinc-700

                  dark:text-zinc-300
                "
              >
                Métiers ciblés
              </label>
            </div>

            <textarea
              rows={5}
              value={
                form.targetRoles
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  targetRoles:
                    event.target
                      .value,
                })
              }
              placeholder={`Développeur Full-Stack
Backend Developer
Data Analyst
Data Engineer
AI Engineer`}
              className="
                profile-input
                resize-y
              "
            />

            <p
              className="
                mt-2
                text-[9px]
                leading-4
                text-zinc-400
              "
            >
              Un métier par ligne.
              JobBoost pourra choisir
              automatiquement le titre
              le plus adapté à chaque
              offre lors de la génération
              du CV.
            </p>
          </div>

          {/* ====================================================
              LINKS
              ==================================================== */}

          <ProfileInput
            placeholder="Portfolio"
            value={
              form.website
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                website:
                  value,
              })
            }
          />

          <ProfileInput
            placeholder="LinkedIn"
            value={
              form.linkedin
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                linkedin:
                  value,
              })
            }
          />

          <ProfileInput
            placeholder="GitHub"
            value={
              form.github
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                github:
                  value,
              })
            }
          />
        </div>

        {/* ======================================================
            SUMMARY
            ====================================================== */}

        <div
          className="
            mt-4
          "
        >
          <label
            className="
              mb-2
              block
              text-[10px]
              font-semibold
              text-zinc-700

              dark:text-zinc-300
            "
          >
            Résumé professionnel
          </label>

          <textarea
            rows={5}
            value={
              form.summary
            }
            onChange={(
              event,
            ) =>
              setForm({
                ...form,

                summary:
                  event.target
                    .value,
              })
            }
            placeholder="Résumé professionnel"
            className="
              profile-input
              resize-y
            "
          />
        </div>

        {/* ======================================================
            ACTIONS
            ====================================================== */}

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

            Sauvegarder
          </button>

          <button
            type="button"
            onClick={() =>
              setEditing(
                false,
              )
            }
            className="profile-secondary-button"
          >
            <X
              size={13}
            />

            Annuler
          </button>
        </div>
      </section>
    );
  }

  // ============================================================
  // DISPLAY MODE
  // ============================================================

  return (
    <section className="profile-card">

      {/* ========================================================
          IDENTITY HEADER
          ======================================================== */}

      <div
        className="
          flex flex-col
          gap-5

          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div
          className="
            flex items-start
            gap-4
          "
        >
          {/* ====================================================
              AVATAR
              ==================================================== */}

          <div className="profile-avatar">
            {
              profile.firstName
                .charAt(
                  0,
                )
                .toUpperCase()
            }

            {
              profile.lastName
                .charAt(
                  0,
                )
                .toUpperCase()
            }
          </div>

          {/* ====================================================
              NAME + HEADLINE + TARGET ROLES
              ==================================================== */}

          <div>
            <h2
              className="
                text-[20px]
                font-semibold
                tracking-[-0.025em]
                text-zinc-950

                dark:text-zinc-50
              "
            >
              {
                profile.firstName
              }{' '}

              {
                profile.lastName
              }
            </h2>

            {profile.headline && (
              <p
                className="
                  mt-1
                  text-[11px]
                  font-medium
                  text-violet-600

                  dark:text-violet-300
                "
              >
                {
                  profile.headline
                }
              </p>
            )}

            {/* ==================================================
                TARGET ROLES
                ================================================== */}

            {profile.targetRoles?.length >
              0 && (
              <div
                className="
                  mt-3
                  flex flex-wrap
                  gap-1.5
                "
              >
                {profile.targetRoles.map(
                  (
                    role,
                  ) => (
                    <span
                      key={
                        role
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5

                        rounded-full
                        border
                        border-violet-200

                        bg-violet-50

                        px-2.5
                        py-1

                        text-[9px]
                        font-semibold
                        text-violet-700

                        dark:border-violet-400/15
                        dark:bg-violet-500/10
                        dark:text-violet-300
                      "
                    >
                      <Target
                        size={9}
                      />

                      {role}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            EDIT BUTTON
            ====================================================== */}

        <button
          type="button"
          onClick={() =>
            setEditing(
              true,
            )
          }
          className="profile-secondary-button"
        >
          <Pencil
            size={13}
          />

          Modifier
        </button>
      </div>

      {/* ========================================================
          SUMMARY
          ======================================================== */}

      {profile.summary && (
        <div
          className="
            mt-5
            border-t
            border-zinc-100
            pt-5

            dark:border-white/[0.06]
          "
        >
          <p
            className="
              mb-2
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.10em]
              text-zinc-400
            "
          >
            Profil
          </p>

          <p
            className="
              max-w-4xl

              text-[11px]
              leading-6
              text-zinc-500

              dark:text-zinc-400
            "
          >
            {
              profile.summary
            }
          </p>
        </div>
      )}

      {/* ========================================================
          CONTACT INFORMATION
          ======================================================== */}

      <div
        className="
          mt-5
          flex flex-wrap
          gap-x-4
          gap-y-2
        "
      >
        {profile.location && (
          <Contact
            icon={
              MapPin
            }
            label={
              profile.location
            }
          />
        )}

        {profile.email && (
          <Contact
            icon={
              Mail
            }
            label={
              profile.email
            }
            href={`mailto:${profile.email}`}
          />
        )}

        {profile.phone && (
          <Contact
            icon={
              Phone
            }
            label={
              profile.phone
            }
            href={`tel:${profile.phone}`}
          />
        )}

        {profile.website && (
          <Contact
            icon={
              Globe2
            }
            label="Portfolio"
            href={
              normalizeUrl(
                profile.website,
              ) ??
              undefined
            }
          />
        )}

        {profile.github && (
          <Contact
            icon={
              Code2
            }
            label="GitHub"
            href={
              normalizeUrl(
                profile.github,
              ) ??
              undefined
            }
          />
        )}

        {profile.linkedin && (
          <Contact
            icon={
              Network
            }
            label="LinkedIn"
            href={
              normalizeUrl(
                profile.linkedin,
              ) ??
              undefined
            }
          />
        )}
      </div>
    </section>
  );
}

// ============================================================
// INPUT
// ============================================================

function ProfileInput({
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

// ============================================================
// CONTACT
// ============================================================

function Contact({
  icon: Icon,
  label,
  href,
}: {
  icon:
    typeof Mail;

  label:
    string;

  href?:
    string;
}) {
  const content = (
    <>
      <Icon
        size={11}
      />

      {label}
    </>
  );

  if (
    href
  ) {
    return (
      <a
        href={
          href
        }
        target={
          href.startsWith(
            'http',
          )
            ? '_blank'
            : undefined
        }
        rel={
          href.startsWith(
            'http',
          )
            ? 'noreferrer'
            : undefined
        }
        className="profile-contact"
      >
        {content}
      </a>
    );
  }

  return (
    <span className="profile-contact">
      {content}
    </span>
  );
}