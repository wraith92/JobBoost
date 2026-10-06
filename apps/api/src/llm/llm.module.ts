import {
  Module,
} from '@nestjs/common';

import { LlmController } from './llm.controller.js';
import { JobAnalyzerService } from './job-analyzer.service.js';
import { ResumeGeneratorService } from './resume-generator.service.js';

@Module({
  controllers: [
    LlmController,
  ],

  providers: [
    JobAnalyzerService,
    ResumeGeneratorService,
  ],
})
export class LlmModule {}