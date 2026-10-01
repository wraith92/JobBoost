import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js'

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.job.findMany({
      orderBy: {
        sourceCreatedAt: 'desc',
      },
    });
  }
}