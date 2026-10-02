import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ApplicationStatus,
} from '../generated/prisma/enums.js';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

type CreateApplicationInput = {
  jobId: string;

  resumeId?: string | null;

  coverLetterId?: string | null;

  channel?: string | null;

  notes?: string | null;
};

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  // ============================================
  // CREATE APPLICATION
  // ============================================

  async create(
    input: CreateApplicationInput,
  ) {
    const job =
      await this.prisma.job.findUnique({
        where: {
          id: input.jobId,
        },
      });

    if (!job) {
      throw new NotFoundException(
        'Offre introuvable',
      );
    }

    // ============================================
    // VALIDATE RESUME
    // ============================================

    let resume = null;

    if (input.resumeId) {
      resume =
        await this.prisma.resume.findUnique({
          where: {
            id: input.resumeId,
          },
        });

      if (!resume) {
        throw new NotFoundException(
          'CV introuvable',
        );
      }

      if (
        resume.jobId &&
        resume.jobId !== input.jobId
      ) {
        throw new BadRequestException(
          'Le CV ne correspond pas à cette offre',
        );
      }
    }

    // ============================================
    // VALIDATE COVER LETTER
    // ============================================

    let coverLetter = null;

    if (input.coverLetterId) {
      coverLetter =
        await this.prisma.coverLetter.findUnique({
          where: {
            id: input.coverLetterId,
          },
        });

      if (!coverLetter) {
        throw new NotFoundException(
          'Lettre de motivation introuvable',
        );
      }

      if (
        coverLetter.jobId !==
        input.jobId
      ) {
        throw new BadRequestException(
          'La lettre de motivation ne correspond pas à cette offre',
        );
      }

      if (
        input.resumeId &&
        coverLetter.resumeId &&
        coverLetter.resumeId !==
          input.resumeId
      ) {
        throw new BadRequestException(
          'La lettre de motivation ne correspond pas au CV sélectionné',
        );
      }
    }

    // ============================================
    // AVOID DUPLICATE ACTIVE APPLICATION
    // ============================================

    const existing =
      await this.prisma.application.findFirst({
        where: {
          jobId:
            input.jobId,

          status: {
            not:
              ApplicationStatus.ARCHIVED,
          },
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Une candidature existe déjà pour cette offre',
      );
    }

    // ============================================
    // CREATE
    // ============================================

    return this.prisma.application.create({
      data: {
        jobId:
          input.jobId,

        resumeId:
          input.resumeId ??
          null,

        coverLetterId:
          input.coverLetterId ??
          null,

        channel:
          input.channel?.trim() ||
          null,

        notes:
          input.notes?.trim() ||
          null,

        // Toujours validation humaine avant envoi
        status:
          ApplicationStatus.READY_TO_VALIDATE,
      },

      include: {
        job: {
          include: {
            analysis: true,
          },
        },

        resume: true,

        coverLetter: true,
      },
    });
  }

  // ============================================
  // LIST APPLICATIONS
  // ============================================

  async findAll() {
    return this.prisma.application.findMany({
      orderBy: {
        createdAt:
          'desc',
      },

      include: {
        job: {
          include: {
            analysis: true,
          },
        },

        resume: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },

        coverLetter: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  }

  // ============================================
  // GET ONE APPLICATION
  // ============================================

  async findOne(
    id: string,
  ) {
    const application =
      await this.prisma.application.findUnique({
        where: {
          id,
        },

        include: {
          job: {
            include: {
              analysis: true,
            },
          },

          resume: true,

          coverLetter: true,
        },
      });

    if (!application) {
      throw new NotFoundException(
        'Candidature introuvable',
      );
    }

    return application;
  }

  // ============================================
  // UPDATE STATUS
  // ============================================

  async updateStatus(
    id: string,
    statusValue: string,
  ) {
    const application =
      await this.prisma.application.findUnique({
        where: {
          id,
        },
      });

    if (!application) {
      throw new NotFoundException(
        'Candidature introuvable',
      );
    }

    const status =
      this.parseStatus(
        statusValue,
      );

    // ============================================
    // BUSINESS RULES
    // ============================================

    if (
      status ===
        ApplicationStatus.SENT &&
      !application.resumeId
    ) {
      throw new BadRequestException(
        'Impossible de marquer la candidature comme envoyée sans CV',
      );
    }

    // ============================================
    // UPDATE
    // ============================================

    return this.prisma.application.update({
      where: {
        id,
      },

      data: {
        status,

        // Première date d'envoi
        appliedAt:
          status ===
          ApplicationStatus.SENT
            ? application.appliedAt ??
              new Date()
            : application.appliedAt,
      },

      include: {
        job: {
          include: {
            analysis: true,
          },
        },

        resume: true,

        coverLetter: true,
      },
    });
  }


  async update(
  id: string,
  input: {
    channel?: string | null;
    notes?: string | null;
    followUpAt?: string | null;
  },
) {
  const application =
    await this.prisma.application.findUnique({
      where: {
        id,
      },
    });

  if (!application) {
    throw new NotFoundException(
      'Candidature introuvable',
    );
  }

  let followUpAt:
    | Date
    | null
    | undefined;

  if (
    input.followUpAt !== undefined
  ) {
    if (!input.followUpAt) {
      followUpAt = null;
    } else {
      const date =
        new Date(
          input.followUpAt,
        );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        throw new BadRequestException(
          'Date de relance invalide',
        );
      }

      followUpAt = date;
    }
  }

  return this.prisma.application.update({
    where: {
      id,
    },

    data: {
      ...(input.channel !== undefined
        ? {
            channel:
              input.channel?.trim() ||
              null,
          }
        : {}),

      ...(input.notes !== undefined
        ? {
            notes:
              input.notes?.trim() ||
              null,
          }
        : {}),

      ...(followUpAt !== undefined
        ? {
            followUpAt,
          }
        : {}),
    },

    include: {
      job: {
        include: {
          analysis: true,
        },
      },

      resume: true,

      coverLetter: true,
    },
  });
}

  // ============================================
  // VALIDATE STATUS
  // ============================================

  private parseStatus(
    value: string,
  ): ApplicationStatus {
    const normalized =
      value
        ?.trim()
        .toUpperCase();

    const allowed =
      Object.values(
        ApplicationStatus,
      );

    if (
      !allowed.includes(
        normalized as ApplicationStatus,
      )
    ) {
      throw new BadRequestException(
        `Statut invalide. Valeurs autorisées : ${allowed.join(', ')}`,
      );
    }

    return normalized as ApplicationStatus;
  }
}