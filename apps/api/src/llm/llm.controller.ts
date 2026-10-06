import {
  Controller,
  Param,
  Post,
} from '@nestjs/common';

import { JobAnalyzerService } from './job-analyzer.service.js';
import { ResumeGeneratorService } from './resume-generator.service.js';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly jobAnalyzerService:
      JobAnalyzerService,

    private readonly resumeGeneratorService:
      ResumeGeneratorService,
  ) {}

  @Post(
    'jobs/:jobId/analyze',
  )
  analyzeJob(
    @Param('jobId')
    jobId: string,
  ) {
    return this.jobAnalyzerService.analyze(
      jobId,
    );
  }

  @Post(
    'applications/:applicationId/generate-resume',
  )
  generateResume(
    @Param('applicationId')
    applicationId: string,
  ) {
    return this.resumeGeneratorService.generate(
      applicationId,
    );
  }
}