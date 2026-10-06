import {
  Module,
} from '@nestjs/common';

import {
  ApplicationsController,
} from './applications.controller.js';

import {
  ApplicationsService,
} from './applications.service.js';

import {
  ResumeModule,
} from '../resume/resume.module.js';

import {
  CoverLetterModule,
} from '../cover-letter/cover-letter.module.js';

import {
  JobAnalyzerService,
} from '../llm/job-analyzer.service.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [
    ResumeModule,
    CoverLetterModule,
     MailModule,
  ],

  controllers: [
    ApplicationsController,
  ],

  providers: [
    ApplicationsService,

    // Permet à /prepare d'analyser
    // automatiquement une offre
    // si nécessaire.
    JobAnalyzerService,
  ],

  exports: [
    ApplicationsService,
  ],
})
export class ApplicationsModule {}