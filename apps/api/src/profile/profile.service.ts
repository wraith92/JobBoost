import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { NotFoundException } from '@nestjs/common';
import { CreateExperienceDto } from './dto/create-experience.dto.js';
import { CreateEducationDto } from './dto/create-education.dto.js';
import { CreateSkillDto } from './dto/create-skill.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateExperienceDto } from './dto/update-experience.dto.js';
import { UpdateEducationDto } from './dto/update-education.dto.js';
import { UpdateSkillDto } from './dto/update-skill.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) { }

    async getProfile() {
        return this.prisma.candidateProfile.findFirst({
            include: {
                experiences: true,
                educations: true,
                skills: true,
                projects: true,
            },
        });
    }

    async createProfile(data: CreateProfileDto) {
        return this.prisma.candidateProfile.create({
            data,
        });
    }
    async createExperience(data: CreateExperienceDto) {
        const profile = await this.prisma.candidateProfile.findFirst();

        if (!profile) {
            throw new NotFoundException('Candidate profile not found');
        }

        return this.prisma.experience.create({
            data: {
                profileId: profile.id,
                company: data.company,
                title: data.title,
                location: data.location,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                current: data.current ?? false,
                description: data.description,
                bullets: data.bullets ?? [],
            },
        });
    }
    async createEducation(data: CreateEducationDto) {
        const profile = await this.prisma.candidateProfile.findFirst();

        if (!profile) {
            throw new NotFoundException('Candidate profile not found');
        }

        return this.prisma.education.create({
            data: {
                profileId: profile.id,
                school: data.school,
                degree: data.degree,
                field: data.field,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                description: data.description,
            },
        });
    }
    async createSkill(data: CreateSkillDto) {
        const profile = await this.prisma.candidateProfile.findFirst();

        if (!profile) {
            throw new NotFoundException('Candidate profile not found');
        }

        return this.prisma.skill.create({
            data: {
                profileId: profile.id,
                name: data.name,
                category: data.category,
                level: data.level,
            },
        });
    }
    async createProject(data: CreateProjectDto) {
        const profile = await this.prisma.candidateProfile.findFirst();

        if (!profile) {
            throw new NotFoundException('Candidate profile not found');
        }

        return this.prisma.project.create({
            data: {
                profileId: profile.id,
                name: data.name,
                description: data.description,
                technologies: data.technologies,
                url: data.url,
                githubUrl: data.githubUrl,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            },
        });
    }
    async updateExperience(id: string, data: UpdateExperienceDto) {
        const experience = await this.prisma.experience.findUnique({
            where: { id },
        });

        if (!experience) {
            throw new NotFoundException('Experience not found');
        }

        return this.prisma.experience.update({
            where: { id },
            data: {
                company: data.company,
                title: data.title,
                location: data.location,
                startDate: data.startDate
                    ? new Date(data.startDate)
                    : undefined,
                endDate: data.endDate
                    ? new Date(data.endDate)
                    : undefined,
                current: data.current,
                description: data.description,
                bullets: data.bullets,
            },
        });
    }

    async deleteExperience(id: string) {
        const experience = await this.prisma.experience.findUnique({
            where: { id },
        });

        if (!experience) {
            throw new NotFoundException('Experience not found');
        }

        return this.prisma.experience.delete({
            where: { id },
        });
    }
    async updateEducation(id: string, data: UpdateEducationDto) {
        const education = await this.prisma.education.findUnique({
            where: { id },
        });

        if (!education) {
            throw new NotFoundException('Education not found');
        }

        return this.prisma.education.update({
            where: { id },
            data: {
                school: data.school,
                degree: data.degree,
                field: data.field,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                description: data.description,
            },
        });
    }

    async deleteEducation(id: string) {
        const education = await this.prisma.education.findUnique({
            where: { id },
        });

        if (!education) {
            throw new NotFoundException('Education not found');
        }

        return this.prisma.education.delete({
            where: { id },
        });
    }

    async updateSkill(id: string, data: UpdateSkillDto) {
        const skill = await this.prisma.skill.findUnique({
            where: { id },
        });

        if (!skill) {
            throw new NotFoundException('Skill not found');
        }

        return this.prisma.skill.update({
            where: { id },
            data,
        });
    }

    async deleteSkill(id: string) {
        const skill = await this.prisma.skill.findUnique({
            where: { id },
        });

        if (!skill) {
            throw new NotFoundException('Skill not found');
        }

        return this.prisma.skill.delete({
            where: { id },
        });
    }

    async updateProject(id: string, data: UpdateProjectDto) {
        const project = await this.prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.prisma.project.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                technologies: data.technologies,
                url: data.url,
                githubUrl: data.githubUrl,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }

    async deleteProject(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.prisma.project.delete({
            where: { id },
        });
    }
    async updateProfile(data: UpdateProfileDto) {
  const profile = await this.prisma.candidateProfile.findFirst();

  if (!profile) {
    throw new NotFoundException('Candidate profile not found');
  }

  return this.prisma.candidateProfile.update({
    where: {
      id: profile.id,
    },
    data,
    include: {
      experiences: true,
      educations: true,
      skills: true,
      projects: true,
    },
  });
}
}
