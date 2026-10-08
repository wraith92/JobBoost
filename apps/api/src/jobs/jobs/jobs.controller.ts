import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { JoobleService } from '../collectors/jooble.service.js';
import { JobsService } from './jobs.service.js';
import { AdzunaService } from '../collectors/adzuna.service.js';
import { FranceTravailService } from '../collectors/france-travail.service.js';
import { WebSearchCollectorService } from '../collectors/web-search-collector.service.js';
import { UpsertJobDto } from './upsert-job.dto.js';
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly franceTravailService: FranceTravailService,
    private readonly adzunaService: AdzunaService,
    private readonly joobleService: JoobleService,
    private readonly webSearchCollectorService: WebSearchCollectorService,
  ) {}
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }
  @Post(':jobId/ready-to-validate')
  markReadyToValidate(
    @Param('jobId')
    jobId: string,
  ) {
    return this.jobsService.markReadyToValidate(
      jobId,
    );
  }
  @Post(':jobId/archive')
  archiveJob(
    @Param('jobId')
    jobId: string,
  ) {
    return this.jobsService.archiveJob(
      jobId,
    );
  }
  @Post('upsert')
  upsertJob(
    @Body()
    body: UpsertJobDto,
  ) {
    return this.jobsService.upsertJob(
      body,
    );
  }
  @Post('import/france-travail')
  importFranceTravail(
    @Query('keyword') keyword?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit =
      limit ? Number(limit) : 3;
    return this.franceTravailService.importLatest(
      keyword || 'développeur',
      parsedLimit,
    );
  }
  @Post('import/adzuna')
  importAdzuna(
    @Query('keyword') keyword?: string,
    @Query('where') where?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adzunaService.importJobs(
      keyword || 'developpeur full stack',
      where || 'Ile-de-France',
      limit ? Number(limit) : 3,
    );
  }
  @Post('import/jooble')
  importJooble(
    @Query('keyword') keyword?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    return this.joobleService.importJobs(
      keyword || 'developpeur full stack',
      location || 'Ile-de-France',
      limit ? Number(limit) : 10,
    );
  }
  @Post('import/free-work')
  importFreeWork(
    @Query('keyword') keyword?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    return this.webSearchCollectorService.importJobs(
      'FREE_WORK',
      'free-work.com',
      keyword || 'developpeur full stack',
      location || 'Ile-de-France',
      limit ? Number(limit) : 10,
    );
  }
  @Post('import/hellowork')
  importHelloWork(
    @Query('keyword') keyword?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    return this.webSearchCollectorService.importJobs(
      'HELLOWORK',
      'hellowork.com',
      keyword || 'developpeur full stack',
      location || 'Ile-de-France',
      limit ? Number(limit) : 10,
    );
  }
  @Post('import/wttj')
  importWttj(
    @Query('keyword') keyword?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    return this.webSearchCollectorService.importJobs(
      'WTTJ',
      'welcometothejungle.com',
      keyword || 'developpeur full stack',
      location || 'Ile-de-France',
      limit ? Number(limit) : 10,
    );
  }
  @Post('import/linkedin')
  importLinkedin(
    @Query('keyword') keyword?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    return this.webSearchCollectorService.importJobs(
      'LINKEDIN',
      'linkedin.com',
      keyword || 'developpeur full stack',
      location || 'Ile-de-France',
      limit ? Number(limit) : 10,
    );
  }
  @Post('import/indeed')
  importIndeed(
    @Query('keyword') keyword?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    return this.webSearchCollectorService.importJobs(
      'INDEED',
      'indeed.com',
      keyword || 'developpeur full stack',
      location || 'Ile-de-France',
      limit ? Number(limit) : 10,
    );
  }
  @Post(':jobId/prepare-application')
  prepareApplication(
    @Param('jobId')
    jobId: string,
  ) {
    return this.jobsService.prepareApplication(
      jobId,
    );
  }
}
