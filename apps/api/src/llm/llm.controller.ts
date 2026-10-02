import {
  Controller,
  Param,
  Post,
} from '@nestjs/common';

import { JobAnalyzerService } from './job-analyzer.service.js';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly jobAnalyzerService: JobAnalyzerService,
  ) {}

  @Post('jobs/:jobId/analyze')
  analyzeJob(
    @Param('jobId') jobId: string,
  ) {
    return this.jobAnalyzerService.analyze(jobId);
  }
}