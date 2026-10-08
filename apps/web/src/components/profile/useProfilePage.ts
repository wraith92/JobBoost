'use client';
import { useCallback, useEffect, useState, } from 'react';
import { API_URL, } from './profile.constants';
import { cleanPayload, } from './profile.utils';
import type { Education, EducationForm, Experience, ExperienceForm, Profile, ProfileForm, Project, ProjectForm, Skill, SkillForm, } from './profile.types';
const EMPTY_PROFILE: ProfileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    targetRoles: '',
    summary: '',
    website: '',
    linkedin: '',
    github: '',
};
const EMPTY_EXPERIENCE: ExperienceForm = {
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    bullets: '',
};
const EMPTY_EDUCATION: EducationForm = {
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
};
const EMPTY_SKILL: SkillForm = {
    name: '',
    category: '',
    level: '',
};
const EMPTY_PROJECT: ProjectForm = {
    name: '',
    description: '',
    technologies: '',
    url: '',
    githubUrl: '',
    startDate: '',
    endDate: '',
};
export function useProfilePage() {
    const [profile, setProfile,] = useState<Profile | null>(null);
    const [loading, setLoading,] = useState(true);
    const [error, setError,] = useState('');
    const [editingProfile, setEditingProfile,] = useState(false);
    const [profileForm, setProfileForm,] = useState<ProfileForm>(EMPTY_PROFILE);
    const [experienceForm, setExperienceForm,] = useState<ExperienceForm>(EMPTY_EXPERIENCE);
    const [educationForm, setEducationForm,] = useState<EducationForm>(EMPTY_EDUCATION);
    const [skillForm, setSkillForm,] = useState<SkillForm>(EMPTY_SKILL);
    const [projectForm, setProjectForm,] = useState<ProjectForm>(EMPTY_PROJECT);
    const [editingExperienceId, setEditingExperienceId,] = useState<string | null>(null);
    const [editingEducationId, setEditingEducationId,] = useState<string | null>(null);
    const [editingSkillId, setEditingSkillId,] = useState<string | null>(null);
    const [editingProjectId, setEditingProjectId,] = useState<string | null>(null);
    const [showExperienceForm, setShowExperienceForm,] = useState(false);
    const [showEducationForm, setShowEducationForm,] = useState(false);
    const [showSkillForm, setShowSkillForm,] = useState(false);
    const [showProjectForm, setShowProjectForm,] = useState(false);
    // ============================================================
    // LOAD
    // ============================================================
    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${API_URL}/profile`, {
                cache: 'no-store',
            });
            if (!response.ok) {
                throw new Error(`Erreur API : ${response.status}`);
            }
            const data = (await response.json()) as Profile;
            setProfile(data);
            setProfileForm({
                firstName: data.firstName ??
                    '',
                lastName: data.lastName ??
                    '',
                email: data.email ??
                    '',
                phone: data.phone ??
                    '',
                location: data.location ??
                    '',
                headline: data.headline ??
                    '',
                targetRoles: (data.targetRoles ?? [])
                    .join('\n'),
                summary: data.summary ??
                    '',
                website: data.website ??
                    '',
                linkedin: data.linkedin ??
                    '',
                github: data.github ??
                    '',
            });
        }
        catch (currentError) {
            setError(currentError instanceof
                Error
                ? currentError.message
                : 'Impossible de charger le profil.');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void loadProfile();
    }, [
        loadProfile,
    ]);
    // ============================================================
    // PROFILE
    // ============================================================
    async function saveProfile() {
        try {
            const payload = cleanPayload({
                firstName: profileForm.firstName.trim(),
                lastName: profileForm.lastName.trim(),
                email: profileForm.email.trim(),
                phone: profileForm.phone.trim(),
                location: profileForm.location.trim(),
                headline: profileForm.headline.trim(),
                targetRoles: profileForm.targetRoles
                    .split(/\n|,/)
                    .map((role) => role.trim())
                    .filter(Boolean),
                summary: profileForm.summary.trim(),
                website: profileForm.website.trim(),
                linkedin: profileForm.linkedin.trim(),
                github: profileForm.github.trim(),
            });
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error('Impossible de modifier le profil.');
            }
            const updated = (await response.json()) as Profile;
            setProfile(updated);
            setEditingProfile(false);
        }
        catch (currentError) {
            alert(currentError instanceof
                Error
                ? currentError.message
                : 'Erreur.');
        }
    }
    // ============================================================
    // EXPERIENCE
    // ============================================================
    async function saveExperience() {
        if (!experienceForm.company.trim() ||
            !experienceForm.title.trim() ||
            !experienceForm.startDate) {
            alert('Entreprise, poste et date de début sont obligatoires.');
            return;
        }
        const payload = cleanPayload({
            company: experienceForm.company.trim(),
            title: experienceForm.title.trim(),
            location: experienceForm.location.trim(),
            startDate: experienceForm.startDate,
            endDate: !experienceForm.current &&
                experienceForm.endDate
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
            ? `${API_URL}/profile/experiences/${editingExperienceId}`
            : `${API_URL}/profile/experiences`;
        const response = await fetch(url, {
            method: editingExperienceId
                ? 'PATCH'
                : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            alert("Impossible d'enregistrer l'expérience.");
            return;
        }
        const saved = (await response.json()) as Experience;
        setProfile((current) => {
            if (!current) {
                return current;
            }
            return {
                ...current,
                experiences: editingExperienceId
                    ? current.experiences.map((experience) => experience.id ===
                        editingExperienceId
                        ? saved
                        : experience)
                    : [
                        ...current.experiences,
                        saved,
                    ],
            };
        });
        cancelExperience();
    }
    async function deleteExperience(id: string) {
        if (!confirm('Supprimer cette expérience ?')) {
            return;
        }
        const response = await fetch(`${API_URL}/profile/experiences/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            alert("Impossible de supprimer l'expérience.");
            return;
        }
        setProfile((current) => current
            ? {
                ...current,
                experiences: current.experiences.filter((experience) => experience.id !==
                    id),
            }
            : current);
    }
    function editExperience(experience: Experience) {
        setEditingExperienceId(experience.id);
        setExperienceForm({
            company: experience.company,
            title: experience.title,
            location: experience.location ??
                '',
            startDate: experience.startDate?.slice(0, 10) ?? '',
            endDate: experience.endDate?.slice(0, 10) ?? '',
            current: experience.current,
            description: experience.description ??
                '',
            bullets: experience.bullets.join('\n'),
        });
        setShowExperienceForm(true);
    }
    function cancelExperience() {
        setExperienceForm(EMPTY_EXPERIENCE);
        setEditingExperienceId(null);
        setShowExperienceForm(false);
    }
    // ============================================================
    // EDUCATION
    // ============================================================
    async function saveEducation() {
        if (!educationForm.school.trim() ||
            !educationForm.degree.trim()) {
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
            ? `${API_URL}/profile/educations/${editingEducationId}`
            : `${API_URL}/profile/educations`;
        const response = await fetch(url, {
            method: editingEducationId
                ? 'PATCH'
                : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            alert("Impossible d'enregistrer la formation.");
            return;
        }
        const saved = (await response.json()) as Education;
        setProfile((current) => {
            if (!current) {
                return current;
            }
            return {
                ...current,
                educations: editingEducationId
                    ? current.educations.map((education) => education.id ===
                        editingEducationId
                        ? saved
                        : education)
                    : [
                        ...current.educations,
                        saved,
                    ],
            };
        });
        cancelEducation();
    }
    async function deleteEducation(id: string) {
        if (!confirm('Supprimer cette formation ?')) {
            return;
        }
        const response = await fetch(`${API_URL}/profile/educations/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            alert('Impossible de supprimer la formation.');
            return;
        }
        setProfile((current) => current
            ? {
                ...current,
                educations: current.educations.filter((education) => education.id !==
                    id),
            }
            : current);
    }
    function editEducation(education: Education) {
        setEditingEducationId(education.id);
        setEducationForm({
            school: education.school,
            degree: education.degree,
            field: education.field ??
                '',
            startDate: education.startDate?.slice(0, 10) ?? '',
            endDate: education.endDate?.slice(0, 10) ?? '',
            description: education.description ??
                '',
        });
        setShowEducationForm(true);
    }
    function cancelEducation() {
        setEducationForm(EMPTY_EDUCATION);
        setEditingEducationId(null);
        setShowEducationForm(false);
    }
    // ============================================================
    // SKILLS
    // ============================================================
    async function saveSkill() {
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
            ? `${API_URL}/profile/skills/${editingSkillId}`
            : `${API_URL}/profile/skills`;
        const response = await fetch(url, {
            method: editingSkillId
                ? 'PATCH'
                : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            alert("Impossible d'enregistrer la compétence.");
            return;
        }
        const saved = (await response.json()) as Skill;
        setProfile((current) => {
            if (!current) {
                return current;
            }
            return {
                ...current,
                skills: editingSkillId
                    ? current.skills.map((skill) => skill.id ===
                        editingSkillId
                        ? saved
                        : skill)
                    : [
                        ...current.skills,
                        saved,
                    ],
            };
        });
        cancelSkill();
    }
    async function deleteSkill(id: string) {
        if (!confirm('Supprimer cette compétence ?')) {
            return;
        }
        const response = await fetch(`${API_URL}/profile/skills/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            alert('Impossible de supprimer la compétence.');
            return;
        }
        setProfile((current) => current
            ? {
                ...current,
                skills: current.skills.filter((skill) => skill.id !==
                    id),
            }
            : current);
    }
    function editSkill(skill: Skill) {
        setEditingSkillId(skill.id);
        setSkillForm({
            name: skill.name,
            category: skill.category ??
                '',
            level: skill.level?.toString() ??
                '',
        });
        setShowSkillForm(true);
    }
    function cancelSkill() {
        setSkillForm(EMPTY_SKILL);
        setEditingSkillId(null);
        setShowSkillForm(false);
    }
    // ============================================================
    // PROJECTS
    // ============================================================
    async function saveProject() {
        if (!projectForm.name.trim()) {
            alert('Le nom du projet est obligatoire.');
            return;
        }
        const technologies = projectForm.technologies
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
        if (technologies.length ===
            0) {
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
            ? `${API_URL}/profile/projects/${editingProjectId}`
            : `${API_URL}/profile/projects`;
        const response = await fetch(url, {
            method: editingProjectId
                ? 'PATCH'
                : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            alert("Impossible d'enregistrer le projet.");
            return;
        }
        const saved = (await response.json()) as Project;
        setProfile((current) => {
            if (!current) {
                return current;
            }
            return {
                ...current,
                projects: editingProjectId
                    ? current.projects.map((project) => project.id ===
                        editingProjectId
                        ? saved
                        : project)
                    : [
                        ...current.projects,
                        saved,
                    ],
            };
        });
        cancelProject();
    }
    async function deleteProject(id: string) {
        if (!confirm('Supprimer ce projet ?')) {
            return;
        }
        const response = await fetch(`${API_URL}/profile/projects/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            alert('Impossible de supprimer le projet.');
            return;
        }
        setProfile((current) => current
            ? {
                ...current,
                projects: current.projects.filter((project) => project.id !==
                    id),
            }
            : current);
    }
    function editProject(project: Project) {
        setEditingProjectId(project.id);
        setProjectForm({
            name: project.name,
            description: project.description ??
                '',
            technologies: project.technologies.join('\n'),
            url: project.url ??
                '',
            githubUrl: project.githubUrl ??
                '',
            startDate: project.startDate?.slice(0, 10) ?? '',
            endDate: project.endDate?.slice(0, 10) ?? '',
        });
        setShowProjectForm(true);
    }
    function cancelProject() {
        setProjectForm(EMPTY_PROJECT);
        setEditingProjectId(null);
        setShowProjectForm(false);
    }
    return {
        profile,
        loading,
        error,
        editingProfile,
        setEditingProfile,
        profileForm,
        setProfileForm,
        experienceForm,
        setExperienceForm,
        educationForm,
        setEducationForm,
        skillForm,
        setSkillForm,
        projectForm,
        setProjectForm,
        editingExperienceId,
        editingEducationId,
        editingSkillId,
        editingProjectId,
        showExperienceForm,
        setShowExperienceForm,
        showEducationForm,
        setShowEducationForm,
        showSkillForm,
        setShowSkillForm,
        showProjectForm,
        setShowProjectForm,
        saveProfile,
        saveExperience,
        deleteExperience,
        editExperience,
        cancelExperience,
        saveEducation,
        deleteEducation,
        editEducation,
        cancelEducation,
        saveSkill,
        deleteSkill,
        editSkill,
        cancelSkill,
        saveProject,
        deleteProject,
        editProject,
        cancelProject,
    };
}
