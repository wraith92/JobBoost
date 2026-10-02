import { Module } from '@nestjs/common';
import { JobAnalyzerService } from './job-analyzer.service.js';
import { LlmController } from './llm.controller.js';

@Module({
  controllers: [LlmController],
  providers: [JobAnalyzerService],
  exports: [JobAnalyzerService],
})
export class LlmModule {}