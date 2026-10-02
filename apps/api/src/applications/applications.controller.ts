import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApplicationsService,
} from './applications.service.js';

type CreateApplicationBody = {
  jobId: string;
  resumeId?: string | null;
  coverLetterId?: string | null;
  channel?: string | null;
  notes?: string | null;
};

type UpdateApplicationBody = {
  channel?: string | null;
  notes?: string | null;
  followUpAt?: string | null;
};

type UpdateApplicationStatusBody = {
  status: string;
};

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService:
      ApplicationsService,
  ) {}

  @Post()
  create(
    @Body()
    body: CreateApplicationBody,
  ) {
    return this.applicationsService.create(
      body,
    );
  }

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.applicationsService.findOne(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    body: UpdateApplicationBody,
  ) {
    return this.applicationsService.update(
      id,
      body,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id')
    id: string,

    @Body()
    body: UpdateApplicationStatusBody,
  ) {
    return this.applicationsService.updateStatus(
      id,
      body.status,
    );
  }
}