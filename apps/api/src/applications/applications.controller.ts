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
import {
  ApplicationFilesService,
} from './application-files.service.js';
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
    private readonly applicationFilesService:
      ApplicationFilesService,
  ) {}

  // ============================================================
  // PREPARE AUTOMATIC APPLICATION
  // ============================================================

  @Post(
    'jobs/:jobId/prepare',
  )
  prepare(
    @Param('jobId')
    jobId: string,
  ) {
    return this.applicationsService.prepare(
      jobId,
    );
  }

  // ============================================================
  // CREATE MANUALLY
  // ============================================================

  @Post()
  create(
    @Body()
    body: CreateApplicationBody,
  ) {
    return this.applicationsService.create(
      body,
    );
  }

  // ============================================================
  // LIST
  // ============================================================

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  // ============================================================
  // GET ONE
  // ============================================================

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.applicationsService.findOne(
      id,
    );
  }

  // ============================================================
  // UPDATE
  // ============================================================

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

  // ============================================================
  // STATUS
  // ============================================================

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

  // ============================================================
  // SEND / VALIDATE
  // ============================================================

  @Post(':id/send')
  send(
    @Param('id')
    id: string,
  ) {
    return this.applicationsService.send(
      id,
    );
  }
  @Post(':id/prepare-files')
prepareFiles(
  @Param('id')
  id: string,
) {
  return this.applicationFilesService
    .prepareFiles(
      id,
    );
}
}