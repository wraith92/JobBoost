'use client';

import { useEffect, useState } from 'react';

type Experience = {
    id: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    bullets: string[];
};

type Education = {
    id: string;
    school: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
};

type Skill = {
    id: string;
    name: string;
    category?: string;
    level?: number;
};

type Project = {
  id: string;
  name: string;
  description?: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
};
type Profile = {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    location?: string;
    headline?: string;
    summary?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
    projects: Project[];
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [showExperienceForm, setShowExperienceForm] = useState(false);
    const [showEducationForm, setShowEducationForm] = useState(false);
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        headline: '',
        summary: '',
        website: '',
        linkedin: '',
        github: '',
    });
    const [experienceForm, setExperienceForm] = useState({
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        bullets: '',
    });
    const [editingExperienceId, setEditingExperienceId] = useState<string | null>(
        null,
    );
    const [educationForm, setEducationForm] = useState({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
    });
    const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
    const [skillForm, setSkillForm] = useState({
        name: '',
        category: '',
        level: '',
    });
    const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
    
    const [projectForm, setProjectForm] = useState({
        name: '',
        description: '',
        technologies: '',
        url: '',
        githubUrl: '',
        startDate: '',
        endDate: '',
    });
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await fetch('http://localhost:3001/profile');

                if (!response.ok) {
                    throw new Error(`Erreur API : ${response.status}`);
                }

                const data: Profile = await response.json();
                setProfile(data);
                setForm({
                    firstName: data.firstName ?? '',
                    lastName: data.lastName ?? '',
                    email: data.email ?? '',
                    phone: data.phone ?? '',
                    location: data.location ?? '',
                    headline: data.headline ?? '',
                    summary: data.summary ?? '',
                    website: data.website ?? '',
                    linkedin: data.linkedin ?? '',
                    github: data.github ?? '',
                });


            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Impossible de charger le profil',
                );
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function saveProfile() {
        try {
            const payload = Object.fromEntries(
                Object.entries(form).filter(([, value]) => value.trim() !== '')
            );

            const response = await fetch('http://localhost:3001/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erreur API :', errorData);
                throw new Error('Impossible de modifier le profil');
            }

            const updatedProfile = await response.json();

            setProfile(updatedProfile);
            setEditing(false);
        } catch (error) {
            console.error(error);
        }
    }
    async function saveExperience() {
        try {
            if (
                !experienceForm.company.trim() ||
                !experienceForm.title.trim() ||
                !experienceForm.startDate
            ) {
                alert('Entreprise, poste et date de début sont obligatoires.');
                return;
            }

            const payload = cleanPayload({
                company: experienceForm.company.trim(),
                title: experienceForm.title.trim(),
                location: experienceForm.location.trim(),
                startDate: experienceForm.startDate,

                endDate:
                    !experienceForm.current && experienceForm.endDate
                        ? experienceForm.endDate
                        : undefined,

                current: experienceForm.current,

                description: experienceForm.description.trim(),

                bullets: experienceForm.bullets
                    .split('\n')
                    .map((item) => item.trim())
                    .filter(Boolean),
            });

            const url = editingExperienceId
                ? `http://localhost:3001/profile/experiences/${editingExperienceId}`
                : 'http://localhost:3001/profile/experiences';

            const response = await fetch(url, {
                method: editingExperienceId ? 'PATCH' : 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error(await response.json());
                throw new Error("Impossible d'enregistrer l'expérience");
            }

            const savedExperience = await response.json();

            setProfile((current) => {
                if (!current) return current;

                if (editingExperienceId) {
                    return {
                        ...current,

                        experiences: current.experiences.map((experience) =>
                            experience.id === editingExperienceId
                                ? savedExperience
                                : experience,
                        ),
                    };
                }

                return {
                    ...current,
                    experiences: [...current.experiences, savedExperience],
                };
            });

            setExperienceForm({
                company: '',
                title: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                bullets: '',
            });

            setEditingExperienceId(null);
            setShowExperienceForm(false);
        } catch (error) {
            console.error(error);
        }
    }
    async function deleteExperience(id: string) {
        if (!confirm('Supprimer cette expérience ?')) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3001/profile/experiences/${id}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                throw new Error("Impossible de supprimer l'expérience");
            }

            setProfile((current) =>
                current
                    ? {
                        ...current,
                        experiences: current.experiences.filter(
                            (experience) => experience.id !== id,
                        ),
                    }
                    : current,
            );
        } catch (error) {
            console.error(error);
        }
    }
    async function saveEducation() {
  try {
    if (!educationForm.school.trim() || !educationForm.degree.trim()) {
      alert('École et diplôme obligatoires.');
      return;
    }

    const payload = cleanPayload({
      school: educationForm.school.trim(),
      degree: educationForm.degree.trim(),
      field: educationForm.field.trim(),
      startDate: educationForm.startDate,
      endDate: educationForm.endDate,
      description: educationForm.description.trim(),
    });

    const url = editingEducationId
      ? `http://localhost:3001/profile/educations/${editingEducationId}`
      : 'http://localhost:3001/profile/educations';

    const response = await fetch(url, {
      method: editingEducationId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(await response.json());
      throw new Error("Impossible d'enregistrer la formation");
    }

    const savedEducation = await response.json();

    setProfile((current) => {
      if (!current) return current;

      if (editingEducationId) {
        return {
          ...current,
          educations: current.educations.map((education) =>
            education.id === editingEducationId
              ? savedEducation
              : education,
          ),
        };
      }

      return {
        ...current,
        educations: [...current.educations, savedEducation],
      };
    });

    setEducationForm({
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
    });

    setEditingEducationId(null);
    setShowEducationForm(false);
  } catch (error) {
    console.error(error);
  }
}
    async function deleteEducation(id: string) {
  if (!confirm('Supprimer cette formation ?')) return;

  try {
    const response = await fetch(
      `http://localhost:3001/profile/educations/${id}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Impossible de supprimer la formation');
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            educations: current.educations.filter(
              (education) => education.id !== id,
            ),
          }
        : current,
    );
  } catch (error) {
    console.error(error);
  }
}
    async function saveSkill() {
  try {
    if (!skillForm.name.trim()) {
      alert('Le nom de la compétence est obligatoire.');
      return;
    }

    const payload = cleanPayload({
      name: skillForm.name.trim(),
      category: skillForm.category.trim(),
      level: skillForm.level
        ? Number(skillForm.level)
        : undefined,
    });

    const url = editingSkillId
      ? `http://localhost:3001/profile/skills/${editingSkillId}`
      : 'http://localhost:3001/profile/skills';

    const response = await fetch(url, {
      method: editingSkillId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(await response.json());
      throw new Error("Impossible d'enregistrer la compétence");
    }

    const savedSkill = await response.json();

    setProfile((current) => {
      if (!current) return current;

      if (editingSkillId) {
        return {
          ...current,
          skills: current.skills.map((skill) =>
            skill.id === editingSkillId ? savedSkill : skill,
          ),
        };
      }

      return {
        ...current,
        skills: [...current.skills, savedSkill],
      };
    });

    setSkillForm({
      name: '',
      category: '',
      level: '',
    });

    setEditingSkillId(null);
    setShowSkillForm(false);
  } catch (error) {
    console.error(error);
  }
}
    async function deleteSkill(id: string) {
  if (!confirm('Supprimer cette compétence ?')) return;

  try {
    const response = await fetch(
      `http://localhost:3001/profile/skills/${id}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Impossible de supprimer la compétence');
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            skills: current.skills.filter((skill) => skill.id !== id),
          }
        : current,
    );
  } catch (error) {
    console.error(error);
  }
}
    async function saveProject() {
  try {
    if (!projectForm.name.trim()) {
      alert('Le nom du projet est obligatoire.');
      return;
    }

    const technologies = projectForm.technologies
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    if (technologies.length === 0) {
      alert('Ajoute au moins une technologie.');
      return;
    }

    const payload = cleanPayload({
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      technologies,
      url: projectForm.url.trim(),
      githubUrl: projectForm.githubUrl.trim(),
      startDate: projectForm.startDate,
      endDate: projectForm.endDate,
    });

    const url = editingProjectId
      ? `http://localhost:3001/profile/projects/${editingProjectId}`
      : 'http://localhost:3001/profile/projects';

    const response = await fetch(url, {
      method: editingProjectId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(await response.json());
      throw new Error("Impossible d'enregistrer le projet");
    }

    const savedProject = await response.json();

    setProfile((current) => {
      if (!current) return current;

      if (editingProjectId) {
        return {
          ...current,
          projects: current.projects.map((project) =>
            project.id === editingProjectId
              ? savedProject
              : project,
          ),
        };
      }

      return {
        ...current,
        projects: [...current.projects, savedProject],
      };
    });

    setProjectForm({
      name: '',
      description: '',
      technologies: '',
      url: '',
      githubUrl: '',
      startDate: '',
      endDate: '',
    });

    setEditingProjectId(null);
    setShowProjectForm(false);
  } catch (error) {
    console.error(error);
  }
}
    async function deleteProject(id: string) {
  if (!confirm('Supprimer ce projet ?')) return;

  try {
    const response = await fetch(
      `http://localhost:3001/profile/projects/${id}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Impossible de supprimer le projet');
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            projects: current.projects.filter(
              (project) => project.id !== id,
            ),
          }
        : current,
    );
  } catch (error) {
    console.error(error);
  }
}
    function cleanPayload<T extends Record<string, unknown>>(data: T) {
        return Object.fromEntries(
            Object.entries(data).filter(([, value]) => {
                if (value === undefined || value === null) return false;

                if (typeof value === 'string' && value.trim() === '') {
                    return false;
                }

                return true;
            }),
        );
    }

    const payload = cleanPayload({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        headline: form.headline.trim(),
        summary: form.summary.trim(),
        website: form.website.trim(),
        linkedin: form.linkedin.trim(),
        github: form.github.trim(),
    });

    if (loading) {
        return <main className="p-8">Chargement du profil...</main>;
    }

    if (error) {
        return (
            <main className="p-8">
                <h1 className="text-2xl font-bold">Erreur</h1>
                <p className="mt-4">{error}</p>
            </main>
        );
    }

    if (!profile) {
        return <main className="p-8">Aucun profil trouvé.</main>;
    }

    return (
        <main className="mx-auto max-w-5xl space-y-10 p-8">
            <section className="rounded-xl border p-6">
                {!editing ? (
                    <>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {profile.firstName} {profile.lastName}
                                </h1>

                                <p className="mt-2 text-xl">
                                    {profile.headline}
                                </p>
                            </div>

                            <button
                                onClick={() => setEditing(true)}
                                className="rounded-lg border px-4 py-2"
                            >
                                Modifier
                            </button>
                        </div>

                        {profile.summary && (
                            <p className="mt-4 leading-7">
                                {profile.summary}
                            </p>
                        )}

                        <div className="mt-6 space-y-2 text-sm">
                            {profile.email && <p>Email : {profile.email}</p>}
                            {profile.phone && <p>Téléphone : {profile.phone}</p>}
                            {profile.location && <p>Localisation : {profile.location}</p>}
                            {profile.website && <p>Site : {profile.website}</p>}
                            {profile.linkedin && <p>LinkedIn : {profile.linkedin}</p>}
                            {profile.github && <p>GitHub : {profile.github}</p>}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <input
                            value={form.firstName}
                            onChange={(e) =>
                                setForm({ ...form, firstName: e.target.value })
                            }
                            placeholder="Prénom"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.lastName}
                            onChange={(e) =>
                                setForm({ ...form, lastName: e.target.value })
                            }
                            placeholder="Nom"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            placeholder="Email"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                            placeholder="Téléphone"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.location}
                            onChange={(e) =>
                                setForm({ ...form, location: e.target.value })
                            }
                            placeholder="Localisation"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.headline}
                            onChange={(e) =>
                                setForm({ ...form, headline: e.target.value })
                            }
                            placeholder="Titre professionnel"
                            className="w-full rounded-lg border p-3"
                        />

                        <textarea
                            value={form.summary}
                            onChange={(e) =>
                                setForm({ ...form, summary: e.target.value })
                            }
                            placeholder="Résumé"
                            rows={5}
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.website}
                            onChange={(e) =>
                                setForm({ ...form, website: e.target.value })
                            }
                            placeholder="Site web"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.linkedin}
                            onChange={(e) =>
                                setForm({ ...form, linkedin: e.target.value })
                            }
                            placeholder="LinkedIn"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={form.github}
                            onChange={(e) =>
                                setForm({ ...form, github: e.target.value })
                            }
                            placeholder="GitHub"
                            className="w-full rounded-lg border p-3"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={saveProfile}
                                className="rounded-lg border px-4 py-2"
                            >
                                Enregistrer
                            </button>

                            <button
                                onClick={() => setEditing(false)}
                                className="rounded-lg border px-4 py-2"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        Expériences
                    </h2>

                    <button
                        onClick={() => setShowExperienceForm(!showExperienceForm)}
                        className="rounded-lg border px-4 py-2"
                    >
                        + Ajouter
                    </button>
                </div>

                {showExperienceForm && (
                    <div className="mb-6 space-y-3 rounded-xl border p-5">
                        <input
                            value={experienceForm.company}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    company: e.target.value,
                                })
                            }
                            placeholder="Entreprise"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={experienceForm.title}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    title: e.target.value,
                                })
                            }
                            placeholder="Poste"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={experienceForm.location}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    location: e.target.value,
                                })
                            }
                            placeholder="Localisation"
                            className="w-full rounded-lg border p-3"
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                            <input
                                type="date"
                                value={experienceForm.startDate}
                                onChange={(e) =>
                                    setExperienceForm({
                                        ...experienceForm,
                                        startDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border p-3"
                            />

                            <input
                                type="date"
                                value={experienceForm.endDate}
                                disabled={experienceForm.current}
                                onChange={(e) =>
                                    setExperienceForm({
                                        ...experienceForm,
                                        endDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border p-3"
                            />
                        </div>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={experienceForm.current}
                                onChange={(e) =>
                                    setExperienceForm({
                                        ...experienceForm,
                                        current: e.target.checked,
                                        endDate: e.target.checked
                                            ? ''
                                            : experienceForm.endDate,
                                    })
                                }
                            />

                            Poste actuel
                        </label>

                        <textarea
                            value={experienceForm.description}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Description"
                            rows={4}
                            className="w-full rounded-lg border p-3"
                        />

                        <textarea
                            value={experienceForm.bullets}
                            onChange={(e) =>
                                setExperienceForm({
                                    ...experienceForm,
                                    bullets: e.target.value,
                                })
                            }
                            placeholder={"Une mission par ligne\nReact / Next.js\nAPI REST\nAzure"}
                            rows={4}
                            className="w-full rounded-lg border p-3"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={saveExperience}
                                className="rounded-lg border px-4 py-2"
                            >
                                Enregistrer
                            </button>

                            <button
                                onClick={() => {
                                    setShowExperienceForm(false);
                                    setEditingExperienceId(null);

                                    setExperienceForm({
                                        company: '',
                                        title: '',
                                        location: '',
                                        startDate: '',
                                        endDate: '',
                                        current: false,
                                        description: '',
                                        bullets: '',
                                    });
                                }}
                                className="rounded-lg border px-4 py-2"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
  {profile.experiences.map((experience) => (
    <article
      key={experience.id}
      className="rounded-xl border p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            {experience.title}
          </h3>

          <p>{experience.company}</p>

          {experience.location && (
            <p className="text-sm">
              {experience.location}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => {
              setEditingExperienceId(experience.id);

              setExperienceForm({
                company: experience.company,
                title: experience.title,
                location: experience.location ?? '',
                startDate: experience.startDate?.slice(0, 10) ?? '',
                endDate: experience.endDate?.slice(0, 10) ?? '',
                current: experience.current,
                description: experience.description ?? '',
                bullets: experience.bullets?.join('\n') ?? '',
              });

              setShowExperienceForm(true);
            }}
            className="rounded-lg border px-3 py-2"
          >
            Modifier
          </button>

          <button
            onClick={() => deleteExperience(experience.id)}
            className="rounded-lg border px-3 py-2"
          >
            Supprimer
          </button>
        </div>
      </div>

      {experience.description && (
        <p className="mt-4">
          {experience.description}
        </p>
      )}

      {experience.bullets?.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {experience.bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
    </article>
  ))}
</div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        Formations
                    </h2>

                    <button
                        onClick={() => setShowEducationForm(!showEducationForm)}
                        className="rounded-lg border px-4 py-2"
                    >
                        + Ajouter
                    </button>
                </div>

                {showEducationForm && (
                    <div className="mb-6 space-y-3 rounded-xl border p-5">
                        <input
                            value={educationForm.school}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    school: e.target.value,
                                })
                            }
                            placeholder="École"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={educationForm.degree}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    degree: e.target.value,
                                })
                            }
                            placeholder="Diplôme"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={educationForm.field}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    field: e.target.value,
                                })
                            }
                            placeholder="Spécialité"
                            className="w-full rounded-lg border p-3"
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                            <input
                                type="date"
                                value={educationForm.startDate}
                                onChange={(e) =>
                                    setEducationForm({
                                        ...educationForm,
                                        startDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border p-3"
                            />

                            <input
                                type="date"
                                value={educationForm.endDate}
                                onChange={(e) =>
                                    setEducationForm({
                                        ...educationForm,
                                        endDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border p-3"
                            />
                        </div>

                        <textarea
                            value={educationForm.description}
                            onChange={(e) =>
                                setEducationForm({
                                    ...educationForm,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Description"
                            rows={4}
                            className="w-full rounded-lg border p-3"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={saveEducation}
                                className="rounded-lg border px-4 py-2"
                            >
                                Enregistrer
                            </button>

                            <button
                                onClick={() => setShowEducationForm(false)}
                                className="rounded-lg border px-4 py-2"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {profile.educations.map((education) => (
  <article
    key={education.id}
    className="rounded-xl border p-5"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold">
          {education.degree}
        </h3>

        <p>{education.school}</p>

        {education.field && (
          <p className="text-sm">
            {education.field}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => {
            setEditingEducationId(education.id);

            setEducationForm({
              school: education.school,
              degree: education.degree,
              field: education.field ?? '',
              startDate: education.startDate?.slice(0, 10) ?? '',
              endDate: education.endDate?.slice(0, 10) ?? '',
              description: education.description ?? '',
            });

            setShowEducationForm(true);
          }}
          className="rounded-lg border px-3 py-2"
        >
          Modifier
        </button>

        <button
          onClick={() => deleteEducation(education.id)}
          className="rounded-lg border px-3 py-2"
        >
          Supprimer
        </button>
      </div>
    </div>

    {education.description && (
      <p className="mt-4">
        {education.description}
      </p>
    )}
  </article>
))}
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        Compétences
                    </h2>

                    <button
                        onClick={() => setShowSkillForm(!showSkillForm)}
                        className="rounded-lg border px-4 py-2"
                    >
                        + Ajouter
                    </button>
                </div>

                {showSkillForm && (
                    <div className="mb-6 space-y-3 rounded-xl border p-5">
                        <input
                            value={skillForm.name}
                            onChange={(e) =>
                                setSkillForm({
                                    ...skillForm,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Compétence"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={skillForm.category}
                            onChange={(e) =>
                                setSkillForm({
                                    ...skillForm,
                                    category: e.target.value,
                                })
                            }
                            placeholder="Catégorie"
                            className="w-full rounded-lg border p-3"
                        />

                        <select
                            value={skillForm.level}
                            onChange={(e) =>
                                setSkillForm({
                                    ...skillForm,
                                    level: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">
                                Niveau
                            </option>
                            <option value="1">1 / 5</option>
                            <option value="2">2 / 5</option>
                            <option value="3">3 / 5</option>
                            <option value="4">4 / 5</option>
                            <option value="5">5 / 5</option>
                        </select>

                        <div className="flex gap-3">
                            <button
                                onClick={saveSkill}
                                className="rounded-lg border px-4 py-2"
                            >
                                Enregistrer
                            </button>

                            <button
                                onClick={() => setShowSkillForm(false)}
                                className="rounded-lg border px-4 py-2"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

              <div className="space-y-4">
  {profile.skills.map((skill) => (
    <article
      key={skill.id}
      className="rounded-xl border p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            {skill.name}
          </h3>

          {skill.category && (
            <p className="text-sm">
              {skill.category}
            </p>
          )}

          {skill.level && (
            <p className="mt-1 text-sm">
              Niveau : {skill.level}/5
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => {
              setEditingSkillId(skill.id);

              setSkillForm({
                name: skill.name,
                category: skill.category ?? '',
                level: skill.level
                  ? String(skill.level)
                  : '',
              });

              setShowSkillForm(true);
            }}
            className="rounded-lg border px-3 py-2"
          >
            Modifier
          </button>

          <button
            onClick={() => deleteSkill(skill.id)}
            className="rounded-lg border px-3 py-2"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  ))}
</div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        Projets
                    </h2>

                    <button
                        onClick={() => setShowProjectForm(!showProjectForm)}
                        className="rounded-lg border px-4 py-2"
                    >
                        + Ajouter
                    </button>
                </div>

                {showProjectForm && (
                    <div className="mb-6 space-y-3 rounded-xl border p-5">
                        <input
                            value={projectForm.name}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Nom du projet"
                            className="w-full rounded-lg border p-3"
                        />

                        <textarea
                            value={projectForm.description}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Description"
                            rows={4}
                            className="w-full rounded-lg border p-3"
                        />

                        <textarea
                            value={projectForm.technologies}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    technologies: e.target.value,
                                })
                            }
                            placeholder={"Une technologie par ligne\nNext.js\nNestJS\nPostgreSQL"}
                            rows={5}
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={projectForm.url}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    url: e.target.value,
                                })
                            }
                            placeholder="URL du projet"
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            value={projectForm.githubUrl}
                            onChange={(e) =>
                                setProjectForm({
                                    ...projectForm,
                                    githubUrl: e.target.value,
                                })
                            }
                            placeholder="URL GitHub"
                            className="w-full rounded-lg border p-3"
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                            <input
                                type="date"
                                value={projectForm.startDate}
                                onChange={(e) =>
                                    setProjectForm({
                                        ...projectForm,
                                        startDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border p-3"
                            />

                            <input
                                type="date"
                                value={projectForm.endDate}
                                onChange={(e) =>
                                    setProjectForm({
                                        ...projectForm,
                                        endDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border p-3"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={saveProject}
                                className="rounded-lg border px-4 py-2"
                            >
                                Enregistrer
                            </button>

                            <button
                                onClick={() => setShowProjectForm(false)}
                                className="rounded-lg border px-4 py-2"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
  {profile.projects.map((project) => (
    <article
      key={project.id}
      className="rounded-xl border p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            {project.name}
          </h3>

          {project.description && (
            <p className="mt-2">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => {
              setEditingProjectId(project.id);

              setProjectForm({
                name: project.name,
                description: project.description ?? '',
                technologies:
                  project.technologies?.join('\n') ?? '',
                url: project.url ?? '',
                githubUrl: project.githubUrl ?? '',
                startDate:
                  project.startDate?.slice(0, 10) ?? '',
                endDate:
                  project.endDate?.slice(0, 10) ?? '',
              });

              setShowProjectForm(true);
            }}
            className="rounded-lg border px-3 py-2"
          >
            Modifier
          </button>

          <button
            onClick={() => deleteProject(project.id)}
            className="rounded-lg border px-3 py-2"
          >
            Supprimer
          </button>
        </div>
      </div>

      {project.technologies?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <span
              key={technology}
              className="rounded-full border px-3 py-1 text-sm"
            >
              {technology}
            </span>
          ))}
        </div>
      )}

      {(project.url || project.githubUrl) && (
        <div className="mt-4 space-y-1 text-sm">
          {project.url && (
            <p>
              Projet :{' '}
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {project.url}
              </a>
            </p>
          )}

          {project.githubUrl && (
            <p>
              GitHub :{' '}
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {project.githubUrl}
              </a>
            </p>
          )}
        </div>
      )}
    </article>
  ))}
</div>
            </section>
        </main>
    );
}