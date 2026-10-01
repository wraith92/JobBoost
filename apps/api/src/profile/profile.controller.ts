
import { ProfileService } from './profile.service.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { CreateExperienceDto } from './dto/create-experience.dto.js';
import { CreateEducationDto } from './dto/create-education.dto.js';
import { CreateSkillDto } from './dto/create-skill.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateExperienceDto } from './dto/update-experience.dto.js';
import { UpdateEducationDto } from './dto/update-education.dto.js';
import { UpdateSkillDto } from './dto/update-skill.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    getProfile() {
        return this.profileService.getProfile();
    }

    @Post()
    createProfile(@Body() body: CreateProfileDto) {
        return this.profileService.createProfile(body);
    }
    @Post('experiences')
    createExperience(@Body() body: CreateExperienceDto) {
        return this.profileService.createExperience(body);
    }
    @Post('educations')
    createEducation(@Body() body: CreateEducationDto) {
        return this.profileService.createEducation(body);
    }
    @Post('skills')
    createSkill(@Body() body: CreateSkillDto) {
        return this.profileService.createSkill(body);
    }
    @Post('projects')
    createProject(@Body() body: CreateProjectDto) {
        return this.profileService.createProject(body);
    }
    @Patch('experiences/:id')
    updateExperience(
        @Param('id') id: string,
        @Body() body: UpdateExperienceDto,
    ) {
        return this.profileService.updateExperience(id, body);
    }

    @Delete('experiences/:id')
    deleteExperience(@Param('id') id: string) {
        return this.profileService.deleteExperience(id);
    }
    @Patch('educations/:id')
    updateEducation(
        @Param('id') id: string,
        @Body() body: UpdateEducationDto,
    ) {
        return this.profileService.updateEducation(id, body);
    }

    @Delete('educations/:id')
    deleteEducation(@Param('id') id: string) {
        return this.profileService.deleteEducation(id);
    }

    @Patch('skills/:id')
    updateSkill(
        @Param('id') id: string,
        @Body() body: UpdateSkillDto,
    ) {
        return this.profileService.updateSkill(id, body);
    }

    @Delete('skills/:id')
    deleteSkill(@Param('id') id: string) {
        return this.profileService.deleteSkill(id);
    }

    @Patch('projects/:id')
    updateProject(
        @Param('id') id: string,
        @Body() body: UpdateProjectDto,
    ) {
        return this.profileService.updateProject(id, body);
    }

    @Delete('projects/:id')
    deleteProject(@Param('id') id: string) {
        return this.profileService.deleteProject(id);
    }
    @Patch()
updateProfile(@Body() body: UpdateProfileDto) {
  return this.profileService.updateProfile(body);
}
}