import {
  Controller,
  Post,
} from '@nestjs/common';

import {
  AutomationService,
} from './automation.service.js';

@Controller('automations')
export class AutomationController {
  constructor(
    private readonly automationService:
      AutomationService,
  ) {}

  @Post('france-travail/run')
  runFranceTravail() {
    return this.automationService
      .runFranceTravail();
  }
}