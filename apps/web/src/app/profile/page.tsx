'use client';

import ProfileEducations
  from '../../components/profile/ProfileEducations';

import ProfileExperiences
  from '../../components/profile/ProfileExperiences';

import ProfileHeader
  from '../../components/profile/ProfileHeader';

import ProfileIdentityCard
  from '../../components/profile/ProfileIdentityCard';

import ProfileLoading
  from '../../components/profile/ProfileLoading';

import ProfileProjects
  from '../../components/profile/ProfileProjects';

import ProfileSkills
  from '../../components/profile/ProfileSkills';

import {
  useProfilePage,
} from '../../components/profile/useProfilePage';

export default function ProfilePage() {
  const state =
    useProfilePage();

  if (
    state.loading
  ) {
    return (
      <ProfileLoading />
    );
  }

  if (
    !state.profile
  ) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-card text-center">
            <p
              className="
                text-[12px]
                font-semibold
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Profil indisponible
            </p>

            <p
              className="
                mt-2
                text-[10px]
                text-zinc-400
              "
            >
              {
                state.error
              }
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div
        className="
          profile-container
          space-y-5
        "
      >
        <ProfileHeader
          profile={
            state.profile
          }
        />

        <ProfileIdentityCard
          profile={
            state.profile
          }
          form={
            state.profileForm
          }
          setForm={
            state.setProfileForm
          }
          editing={
            state.editingProfile
          }
          setEditing={
            state.setEditingProfile
          }
          onSave={() =>
            void state.saveProfile()
          }
        />

        <ProfileExperiences
          experiences={
            state.profile
              .experiences
          }
          form={
            state.experienceForm
          }
          setForm={
            state.setExperienceForm
          }
          showForm={
            state.showExperienceForm
          }
          setShowForm={
            state.setShowExperienceForm
          }
          editingId={
            state.editingExperienceId
          }
          onSave={() =>
            void state.saveExperience()
          }
          onEdit={
            state.editExperience
          }
          onDelete={(
            id,
          ) =>
            void state.deleteExperience(
              id,
            )
          }
          onCancel={
            state.cancelExperience
          }
        />

        <ProfileSkills
          skills={
            state.profile
              .skills
          }
          form={
            state.skillForm
          }
          setForm={
            state.setSkillForm
          }
          showForm={
            state.showSkillForm
          }
          setShowForm={
            state.setShowSkillForm
          }
          editingId={
            state.editingSkillId
          }
          onSave={() =>
            void state.saveSkill()
          }
          onEdit={
            state.editSkill
          }
          onDelete={(
            id,
          ) =>
            void state.deleteSkill(
              id,
            )
          }
          onCancel={
            state.cancelSkill
          }
        />

        <ProfileProjects
          projects={
            state.profile
              .projects
          }
          form={
            state.projectForm
          }
          setForm={
            state.setProjectForm
          }
          showForm={
            state.showProjectForm
          }
          setShowForm={
            state.setShowProjectForm
          }
          editingId={
            state.editingProjectId
          }
          onSave={() =>
            void state.saveProject()
          }
          onEdit={
            state.editProject
          }
          onDelete={(
            id,
          ) =>
            void state.deleteProject(
              id,
            )
          }
          onCancel={
            state.cancelProject
          }
        />

        <ProfileEducations
          educations={
            state.profile
              .educations
          }
          form={
            state.educationForm
          }
          setForm={
            state.setEducationForm
          }
          showForm={
            state.showEducationForm
          }
          setShowForm={
            state.setShowEducationForm
          }
          editingId={
            state.editingEducationId
          }
          onSave={() =>
            void state.saveEducation()
          }
          onEdit={
            state.editEducation
          }
          onDelete={(
            id,
          ) =>
            void state.deleteEducation(
              id,
            )
          }
          onCancel={
            state.cancelEducation
          }
        />
      </div>
    </main>
  );
}