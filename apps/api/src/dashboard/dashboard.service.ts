import {
  Injectable,
} from '@nestjs/common';

import {
  ApplicationStatus,
} from '../generated/prisma/enums.js';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  // ============================================================
  // DASHBOARD STATS
  // ============================================================

  async getStats(
    periodDays = 30,
  ) {
    // ==========================================================
    // PÉRIODE ACTIVITÉ
    // ==========================================================

    const activityStart =
      new Date();

    activityStart.setHours(
      0,
      0,
      0,
      0,
    );

    activityStart.setDate(
      activityStart.getDate() -
        (periodDays - 1),
    );

    // ==========================================================
    // DATABASE QUERIES
    // ==========================================================

    const [
      totalJobs,

      analyzedJobs,

      compatibleJobs,

      averageScoreResult,

      totalApplications,

      readyApplications,

      sentApplications,

      responseApplications,

      interviewApplications,

      jobsForSources,

      analysesForSkills,

      topAnalyses,

      recentApplications,

      jobsActivity,

      analysesActivity,

      applicationsActivity,
    ] = await Promise.all([
      // --------------------------------------------------------
      // OFFRES TOTAL
      // --------------------------------------------------------

      this.prisma.job.count(),

      // --------------------------------------------------------
      // OFFRES ANALYSÉES
      // --------------------------------------------------------

      this.prisma.jobAnalysis.count(),

      // --------------------------------------------------------
      // SCORE >= 50
      // --------------------------------------------------------

      this.prisma.jobAnalysis.count({
        where: {
          score: {
            gte: 50,
          },
        },
      }),

      // --------------------------------------------------------
      // SCORE MOYEN
      // --------------------------------------------------------

      this.prisma.jobAnalysis.aggregate({
        _avg: {
          score: true,
        },
      }),

      // --------------------------------------------------------
      // CANDIDATURES TOTAL
      // --------------------------------------------------------

      this.prisma.application.count(),

      // --------------------------------------------------------
      // READY TO VALIDATE
      // --------------------------------------------------------

      this.prisma.application.count({
        where: {
          status:
            ApplicationStatus.READY_TO_VALIDATE,
        },
      }),

      // --------------------------------------------------------
      // ENVOYÉES
      //
      // Si une candidature est en réponse / entretien /
      // refus / relance, elle a forcément déjà été envoyée.
      // --------------------------------------------------------

      this.prisma.application.count({
        where: {
          status: {
            in: [
              ApplicationStatus.SENT,
              ApplicationStatus.RESPONSE_RECEIVED,
              ApplicationStatus.INTERVIEW,
              ApplicationStatus.REJECTED,
              ApplicationStatus.FOLLOW_UP,
            ],
          },
        },
      }),

      // --------------------------------------------------------
      // RÉPONSES
      // --------------------------------------------------------

      this.prisma.application.count({
        where: {
          status: {
            in: [
              ApplicationStatus.RESPONSE_RECEIVED,
              ApplicationStatus.INTERVIEW,
              ApplicationStatus.REJECTED,
            ],
          },
        },
      }),

      // --------------------------------------------------------
      // ENTRETIENS
      // --------------------------------------------------------

      this.prisma.application.count({
        where: {
          status:
            ApplicationStatus.INTERVIEW,
        },
      }),

      // --------------------------------------------------------
      // SOURCES
      // --------------------------------------------------------

      this.prisma.job.findMany({
        select: {
          source: true,
        },
      }),

      // --------------------------------------------------------
      // TECHNOLOGIES / SKILLS
      // --------------------------------------------------------

      this.prisma.jobAnalysis.findMany({
        select: {
          technologies: true,

          missingSkills: true,
        },
      }),

      // --------------------------------------------------------
      // TOP JOBS
      // --------------------------------------------------------

      this.prisma.jobAnalysis.findMany({
        where: {
          score: {
            not: null,
          },
        },

        orderBy: {
          score:
            'desc',
        },

        take: 5,

        include: {
          job: true,
        },
      }),

      // --------------------------------------------------------
      // CANDIDATURES RÉCENTES
      // --------------------------------------------------------

      this.prisma.application.findMany({
        orderBy: {
          createdAt:
            'desc',
        },

        take: 5,

        include: {
          job: {
            include: {
              analysis:
                true,
            },
          },

          resume:
            true,

          coverLetter:
            true,
        },
      }),

      // --------------------------------------------------------
      // ACTIVITÉ — OFFRES
      // --------------------------------------------------------

      this.prisma.job.findMany({
        where: {
          createdAt: {
            gte:
              activityStart,
          },
        },

        select: {
          createdAt:
            true,
        },
      }),

      // --------------------------------------------------------
      // ACTIVITÉ — ANALYSES IA
      // --------------------------------------------------------

      this.prisma.jobAnalysis.findMany({
        where: {
          createdAt: {
            gte:
              activityStart,
          },
        },

        select: {
          createdAt:
            true,
        },
      }),

      // --------------------------------------------------------
      // ACTIVITÉ — CANDIDATURES
      // --------------------------------------------------------

      this.prisma.application.findMany({
        where: {
          createdAt: {
            gte:
              activityStart,
          },
        },

        select: {
          createdAt:
            true,
        },
      }),
    ]);

    // ============================================================
    // SCORE MOYEN
    // ============================================================

    const averageScore =
      averageScoreResult
        ._avg.score !==
      null
        ? Math.round(
            averageScoreResult
              ._avg.score,
          )
        : 0;

    // ============================================================
    // SOURCES
    // ============================================================

    const sourceMap =
      new Map<
        string,
        number
      >();

    for (
      const job
      of jobsForSources
    ) {
      sourceMap.set(
        job.source,

        (
          sourceMap.get(
            job.source,
          ) ?? 0
        ) + 1,
      );
    }

    const sources =
      Array.from(
        sourceMap.entries(),
      )
        .map(
          ([
            source,
            count,
          ]) => ({
            source,
            count,
          }),
        )
        .sort(
          (a, b) =>
            b.count -
            a.count,
        );

    // ============================================================
    // TOP TECHNOLOGIES
    // ============================================================

    const technologyMap =
      new Map<
        string,
        number
      >();

    for (
      const analysis
      of analysesForSkills
    ) {
      const uniqueTechnologies =
        new Set(
          analysis.technologies
            .map(
              (
                technology,
              ) =>
                technology.trim(),
            )
            .filter(
              Boolean,
            ),
        );

      for (
        const technology
        of uniqueTechnologies
      ) {
        technologyMap.set(
          technology,

          (
            technologyMap.get(
              technology,
            ) ?? 0
          ) + 1,
        );
      }
    }

    const topTechnologies =
      Array.from(
        technologyMap.entries(),
      )
        .map(
          ([
            name,
            count,
          ]) => ({
            name,
            count,
          }),
        )
        .sort(
          (a, b) =>
            b.count -
            a.count,
        )
        .slice(
          0,
          10,
        );

    // ============================================================
    // TOP MISSING SKILLS
    // ============================================================

    const missingSkillMap =
      new Map<
        string,
        number
      >();

    for (
      const analysis
      of analysesForSkills
    ) {
      const uniqueSkills =
        new Set(
          analysis.missingSkills
            .map(
              (
                skill,
              ) =>
                skill.trim(),
            )
            .filter(
              Boolean,
            ),
        );

      for (
        const skill
        of uniqueSkills
      ) {
        missingSkillMap.set(
          skill,

          (
            missingSkillMap.get(
              skill,
            ) ?? 0
          ) + 1,
        );
      }
    }

    const topMissingSkills =
      Array.from(
        missingSkillMap.entries(),
      )
        .map(
          ([
            name,
            count,
          ]) => ({
            name,
            count,
          }),
        )
        .sort(
          (a, b) =>
            b.count -
            a.count,
        )
        .slice(
          0,
          10,
        );

    // ============================================================
    // TOP JOBS
    // ============================================================

    const topJobs =
      topAnalyses.map(
        (
          analysis,
        ) => ({
          id:
            analysis.job.id,

          externalId:
            analysis.job
              .externalId,

          title:
            analysis.job.title,

          company:
            analysis.job.company,

          location:
            analysis.job.location,

          source:
            analysis.job.source,

          score:
            analysis.score,

          technologies:
            analysis.technologies,

          matchedSkills:
            analysis.matchedSkills,

          missingSkills:
            analysis.missingSkills,
        }),
      );

    // ============================================================
    // RATES
    // ============================================================

    const responseRate =
      sentApplications >
      0
        ? Math.round(
            (
              responseApplications /
              sentApplications
            ) *
              100,
          )
        : 0;

    const interviewRate =
      sentApplications >
      0
        ? Math.round(
            (
              interviewApplications /
              sentApplications
            ) *
              100,
          )
        : 0;

    // ============================================================
    // ACTIVITY
    // ============================================================

    const activityMap =
      new Map<
        string,
        {
          date: string;

          label: string;

          jobs: number;

          analyses: number;

          applications: number;
        }
      >();

    // ------------------------------------------------------------
    // LOCAL DATE KEY
    //
    // Évite les décalages de date liés au fuseau horaire.
    // ------------------------------------------------------------

    function getDateKey(
      date: Date,
    ) {
      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() +
            1,
        ).padStart(
          2,
          '0',
        );

      const day =
        String(
          date.getDate(),
        ).padStart(
          2,
          '0',
        );

      return `${year}-${month}-${day}`;
    }

    // ------------------------------------------------------------
    // INITIALISER TOUS LES JOURS
    // ------------------------------------------------------------

    for (
      let index = 0;
      index <
      periodDays;
      index++
    ) {
      const date =
        new Date(
          activityStart,
        );

      date.setDate(
        activityStart.getDate() +
          index,
      );

      const key =
        getDateKey(
          date,
        );

      const label =
        date.toLocaleDateString(
          'fr-FR',
          {
            day:
              '2-digit',

            month:
              '2-digit',
          },
        );

      activityMap.set(
        key,
        {
          date:
            key,

          label,

          jobs:
            0,

          analyses:
            0,

          applications:
            0,
        },
      );
    }

    // ------------------------------------------------------------
    // OFFRES PAR JOUR
    // ------------------------------------------------------------

    for (
      const job
      of jobsActivity
    ) {
      const key =
        getDateKey(
          job.createdAt,
        );

      const item =
        activityMap.get(
          key,
        );

      if (item) {
        item.jobs++;
      }
    }

    // ------------------------------------------------------------
    // ANALYSES PAR JOUR
    // ------------------------------------------------------------

    for (
      const analysis
      of analysesActivity
    ) {
      const key =
        getDateKey(
          analysis.createdAt,
        );

      const item =
        activityMap.get(
          key,
        );

      if (item) {
        item.analyses++;
      }
    }

    // ------------------------------------------------------------
    // CANDIDATURES PAR JOUR
    // ------------------------------------------------------------

    for (
      const application
      of applicationsActivity
    ) {
      const key =
        getDateKey(
          application.createdAt,
        );

      const item =
        activityMap.get(
          key,
        );

      if (item) {
        item.applications++;
      }
    }

    const activity =
      Array.from(
        activityMap.values(),
      );

    // ============================================================
    // RESPONSE
    // ============================================================

    return {
      jobs: {
        total:
          totalJobs,

        analyzed:
          analyzedJobs,

        compatible:
          compatibleJobs,

        remainingToAnalyze:
          Math.max(
            totalJobs -
              analyzedJobs,
            0,
          ),

        averageScore,
      },

      applications: {
        total:
          totalApplications,

        ready:
          readyApplications,

        sent:
          sentApplications,

        responses:
          responseApplications,

        interviews:
          interviewApplications,

        responseRate,

        interviewRate,
      },

      sources,

      topJobs,

      topTechnologies,

      topMissingSkills,

      // ========================================================
      // ACTIVITY
      // ========================================================

      activity: {
        periodDays,

        series:
          activity,
      },

      // ========================================================
      // RECENT APPLICATIONS
      // ========================================================

      recentApplications:
        recentApplications.map(
          (
            application,
          ) => ({
            id:
              application.id,

            status:
              application.status,

            channel:
              application.channel,

            appliedAt:
              application.appliedAt,

            followUpAt:
              application.followUpAt,

            createdAt:
              application.createdAt,

            resumeId:
              application.resumeId,

            coverLetterId:
              application.coverLetterId,

            job: {
              id:
                application
                  .job.id,

              externalId:
                application
                  .job
                  .externalId,

              title:
                application
                  .job
                  .title,

              company:
                application
                  .job
                  .company,

              location:
                application
                  .job
                  .location,

              source:
                application
                  .job
                  .source,

              score:
                application
                  .job
                  .analysis
                  ?.score ??
                null,
            },
          }),
        ),
    };
  }
}