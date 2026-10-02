import {
  Module,
} from '@nestjs/common';

import {
  ResumeController,
} from './resume.controller.js';

import {
  ResumeComposerService,
} from './resume-composer.service.js';

import {
  ResumePdfService,
} from './resume-pdf.service.js';

@Module({
  controllers: [
    ResumeController,
  ],

  providers: [
    ResumeComposerService,
    ResumePdfService,
  ],

  exports: [
    ResumeComposerService,
    ResumePdfService,
  ],
})
export class ResumeModule {}