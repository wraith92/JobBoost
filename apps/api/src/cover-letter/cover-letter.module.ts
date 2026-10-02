import {
  Module,
} from '@nestjs/common';

import {
  CoverLetterController,
} from './cover-letter.controller.js';

import {
  CoverLetterService,
} from './cover-letter.service.js';
import {
  CoverLetterPdfService,
} from './cover-letter-pdf.service.js';

@Module({
  controllers: [
    CoverLetterController,
  ],

  providers: [
    CoverLetterService,
    CoverLetterPdfService,
  ],

  exports: [
    CoverLetterService,
  ],
})
export class CoverLetterModule {}