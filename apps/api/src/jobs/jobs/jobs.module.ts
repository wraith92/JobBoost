import { Module } from '@nestjs/common';

import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';
import { JoobleService } from '../collectors/jooble.service.js';
import { FranceTravailService } from '../collectors/france-travail.service.js';
import { AdzunaService } from '../collectors/adzuna.service.js';
import { WebSearchCollectorService } from '../collectors/web-search-collector.service.js';

@Module({
  controllers: [
    JobsController,
  ],

  providers: [
    JobsService,
    FranceTravailService,
    AdzunaService,
    JoobleService,
     WebSearchCollectorService,
  ],
})
export class JobsModule {}