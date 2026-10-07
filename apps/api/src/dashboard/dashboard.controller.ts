import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  DashboardService,
} from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService:
      DashboardService,
  ) {}

  @Get('stats')
  async getStats(
    @Query('days')
    days?: string,
  ) {
    const parsedDays =
      Number(days);

    const periodDays =
      parsedDays === 7
        ? 7
        : 30;

    return this.dashboardService.getStats(
      periodDays,
    );
  }
}