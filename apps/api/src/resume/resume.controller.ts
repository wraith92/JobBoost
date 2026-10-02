import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';

import type {
  Response,
} from 'express';

import {
  ResumeComposerService,
} from './resume-composer.service.js';

import {
  ResumePdfService,
} from './resume-pdf.service.js';

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly resumeComposerService:
      ResumeComposerService,

    private readonly resumePdfService:
      ResumePdfService,
  ) {}

  @Post('jobs/:jobId/generate')
  generate(
    @Param('jobId')
    jobId: string,
  ) {
    return this
      .resumeComposerService
      .generate(jobId);
  }

  @Get(':resumeId/pdf')
  async downloadPdf(
    @Param('resumeId')
    resumeId: string,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const {
      buffer,
      filename,
    } =
      await this.resumePdfService
        .generatePdf(
          resumeId,
        );

    response.set({
      'Content-Type':
        'application/pdf',

      'Content-Disposition':
        `attachment; filename="${filename}"`,

      'Content-Length':
        buffer.length.toString(),
    });

    return new StreamableFile(
      buffer,
    );
  }

  @Get(':resumeId')
  findOne(
    @Param('resumeId')
    resumeId: string,
  ) {
    return this
      .resumeComposerService
      .findOne(resumeId);
  }
}