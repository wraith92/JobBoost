import {
  Body,
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
  CoverLetterPdfService,
} from './cover-letter-pdf.service.js';
import {
  CoverLetterService,
} from './cover-letter.service.js';

@Controller('cover-letter')
export class CoverLetterController {
  constructor(
    private readonly coverLetterService:
      CoverLetterService,
    private readonly coverLetterPdfService:
    CoverLetterPdfService,
  ) {}

  @Post('jobs/:jobId/generate')
  generate(
    @Param('jobId')
    jobId: string,

    @Body()
    body: {
      resumeId: string;
    },
  ) {
    return this
      .coverLetterService
      .generate(
        jobId,
        body.resumeId,
      );
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this
      .coverLetterService
      .findOne(id);
  }
  @Get(':id/pdf')
async downloadPdf(
  @Param('id')
  id: string,

  @Res({
    passthrough: true,
  })
  response: Response,
) {
  const {
    buffer,
    filename,
  } =
    await this.coverLetterPdfService
      .generatePdf(id);

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
}