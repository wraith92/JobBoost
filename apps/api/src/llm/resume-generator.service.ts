import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type OllamaResponse = {
  message?: {
    content?: string;
  };
};

type GeneratedResume = {
  headline?: string;
  summary?: string;
  skills?: string[];

  experienceBullets?: {
    experienceId: string;
    bullets: string[];
  }[];

  projectBullets?: {
    projectId: string;
    bullets: string[];
  }[];
};

@Injectable()
export class ResumeGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // GENERATE RESUME
  // ============================================================

  async generate(
    applicationId: string,
  ) {
    // ============================================================
    // 1. APPLICATION
    // ============================================================

    const application =
      await this.prisma.application.findUnique({
        where: {
          id: applicationId,
        },

        include: {
          resume: true,

          job: {
            include: {
              analysis: true,
            },
          },
        },
      });

    if (!application) {
      throw new NotFoundException(
        `Application ${applicationId} introuvable`,
      );
    }

    const job =
      application.job;

    const analysis =
      job.analysis;

    if (!analysis) {
      throw new BadRequestException(
        "L'offre doit être analysée avant de générer le CV",
      );
    }

    const score =
      analysis.score ?? 0;

    if (score < 70) {
      throw new BadRequestException(
        'Le score doit être >= 70 pour générer un CV personnalisé',
      );
    }

    // ============================================================
    // 2. PROFIL CANDIDAT
    // ============================================================

    const profile =
      await this.prisma.candidateProfile.findFirst({
        include: {
          experiences: {
            orderBy: {
              startDate: 'desc',
            },
          },

          educations: {
            orderBy: {
              startDate: 'desc',
            },
          },

          skills: true,

          projects: {
            orderBy: {
              startDate: 'desc',
            },
          },
        },
      });

    if (!profile) {
      throw new NotFoundException(
        'Profil candidat introuvable',
      );
    }

    // ============================================================
    // 3. POOL DE COMPÉTENCES RÉELLES
    // ============================================================

    const availableSkills =
      Array.from(
        new Set(
          [
            ...profile.skills.map(
              (skill) => skill.name,
            ),

            ...profile.projects.flatMap(
              (project) =>
                project.technologies,
            ),
          ]
            .map(
              (value) =>
                value.trim(),
            )
            .filter(Boolean),
        ),
      );

    // ============================================================
    // 4. SOURCE DE VÉRITÉ
    // ============================================================

    const candidateSource = {
      profile: {
        firstName:
          profile.firstName,

        lastName:
          profile.lastName,

        location:
          profile.location,

        headline:
          profile.headline,

        summary:
          profile.summary,

        website:
          profile.website,

        linkedin:
          profile.linkedin,

        github:
          profile.github,
      },

      availableSkills,

      experiences:
        profile.experiences.map(
          (experience) => ({
            id:
              experience.id,

            company:
              experience.company,

            title:
              experience.title,

            location:
              experience.location,

            startDate:
              experience.startDate,

            endDate:
              experience.endDate,

            current:
              experience.current,

            description:
              experience.description,

            bullets:
              experience.bullets,
          }),
        ),

      projects:
        profile.projects.map(
          (project) => ({
            id:
              project.id,

            name:
              project.name,

            description:
              project.description,

            technologies:
              project.technologies,

            url:
              project.url,

            githubUrl:
              project.githubUrl,
          }),
        ),

      educations:
        profile.educations.map(
          (education) => ({
            school:
              education.school,

            degree:
              education.degree,

            field:
              education.field,

            startDate:
              education.startDate,

            endDate:
              education.endDate,

            description:
              education.description,
          }),
        ),
    };

    // ============================================================
    // 5. OFFRE CIBLE
    // ============================================================

    const targetJob = {
      id:
        job.id,

      title:
        job.title,

      company:
        job.company,

      description:
        job.description,

      location:
        job.location,

      contractType:
        job.contractType,

      requiredSkills:
        analysis.requiredSkills,

      optionalSkills:
        analysis.optionalSkills,

      technologies:
        analysis.technologies,

      matchedSkills:
        analysis.matchedSkills,

      missingSkills:
        analysis.missingSkills,

      score:
        analysis.score,

      summary:
        analysis.summary,
    };

    // ============================================================
    // 6. PROMPT
    // ============================================================

    const prompt = `
Tu dois préparer un CV personnalisé pour une offre d'emploi.

IMPORTANT :

Tu ne dois JAMAIS inventer une expérience, une entreprise,
une compétence, une technologie, un projet, un diplôme
ou une responsabilité.

Le CV doit rester 100% fidèle au profil candidat fourni.

Ton rôle est uniquement de :

- sélectionner les informations les plus pertinentes ;
- reformuler certains bullets ;
- mettre en avant les compétences réellement présentes ;
- adapter le résumé professionnel à l'offre ;
- réordonner les compétences selon la pertinence.

--------------------------------------------------
RÈGLES ABSOLUES
--------------------------------------------------

1. Ne jamais ajouter une compétence absente du profil candidat.

2. Les éléments présents dans missingSkills ne doivent jamais
être présentés comme maîtrisés par le candidat.

3. skills doit contenir uniquement des éléments présents
dans availableSkills.

4. Tu peux sélectionner les matchedSkills lorsqu'elles sont
réellement supportées par le profil.

5. Ne change jamais :

- le nom d'une entreprise ;
- l'intitulé réel d'une expérience ;
- les dates ;
- les diplômes ;
- les écoles ;
- le nom d'un projet.

6. Pour experienceBullets :

- utilise uniquement les experienceId fournis ;
- reformule uniquement les faits existants ;
- ne crée aucun chiffre ;
- ne crée aucun résultat ;
- ne crée aucune technologie absente de l'expérience ;
- maximum 4 bullets par expérience.

7. Pour projectBullets :

- utilise uniquement les projectId fournis ;
- reformule uniquement les informations existantes ;
- maximum 3 bullets par projet.

8. Le résumé doit être court :
environ 3 à 5 lignes.

9. Le headline doit être adapté au poste,
mais rester fidèle au profil.

10. Retourne uniquement du JSON valide.

--------------------------------------------------
FORMAT
--------------------------------------------------

{
  "headline": "",
  "summary": "",
  "skills": [],
  "experienceBullets": [
    {
      "experienceId": "",
      "bullets": []
    }
  ],
  "projectBullets": [
    {
      "projectId": "",
      "bullets": []
    }
  ]
}

--------------------------------------------------
OFFRE CIBLE
--------------------------------------------------

${JSON.stringify(
  targetJob,
  null,
  2,
)}

--------------------------------------------------
PROFIL CANDIDAT
--------------------------------------------------

${JSON.stringify(
  candidateSource,
  null,
  2,
)}
`;

    // ============================================================
    // 7. OLLAMA
    // ============================================================

    const generated =
      await this.callOllama(
        prompt,
      );

    // ============================================================
    // 8. NETTOYAGE + SÉCURITÉ
    // ============================================================

    const generatedSkills =
      this.cleanArray(
        generated.skills,
      );

    // On refuse toute compétence qui
    // n'existe pas réellement dans le profil.

    const safeSkills =
      generatedSkills.filter(
        (generatedSkill) =>
          availableSkills.some(
            (availableSkill) =>
              this.sameSkill(
                generatedSkill,
                availableSkill,
              ),
          ),
      );

    // ============================================================
    // 9. EXPERIENCES
    // ============================================================

    const experiences =
      profile.experiences.map(
        (experience) => {
          const generatedExperience =
            generated.experienceBullets?.find(
              (item) =>
                item.experienceId ===
                experience.id,
            );

          const bullets =
            this.cleanArray(
              generatedExperience
                ?.bullets,
            );

          return {
            id:
              experience.id,

            company:
              experience.company,

            title:
              experience.title,

            location:
              experience.location,

            startDate:
              experience.startDate,

            endDate:
              experience.endDate,

            current:
              experience.current,

            description:
              experience.description,

            bullets:
              bullets.length > 0
                ? bullets.slice(
                    0,
                    4,
                  )
                : experience.bullets,
          };
        },
      );

    // ============================================================
    // 10. PROJECTS
    // ============================================================

    const projects =
      profile.projects.map(
        (project) => {
          const generatedProject =
            generated.projectBullets?.find(
              (item) =>
                item.projectId ===
                project.id,
            );

          return {
            id:
              project.id,

            name:
              project.name,

            description:
              project.description,

            technologies:
              project.technologies,

            url:
              project.url,

            githubUrl:
              project.githubUrl,

            bullets:
              this.cleanArray(
                generatedProject
                  ?.bullets,
              ).slice(
                0,
                3,
              ),
          };
        },
      );

    // ============================================================
    // 11. CONTENU FINAL DU CV
    // ============================================================

    const resumeContent = {
      targetJob: {
        jobId:
          job.id,

        title:
          job.title,

        company:
          job.company,

        score:
          analysis.score,
      },

      personal: {
        firstName:
          profile.firstName,

        lastName:
          profile.lastName,

        email:
          profile.email,

        phone:
          profile.phone,

        location:
          profile.location,

        website:
          profile.website,

        linkedin:
          profile.linkedin,

        github:
          profile.github,
      },

      headline:
        generated.headline ??
        profile.headline,

      summary:
        generated.summary ??
        profile.summary,

      skills:
        safeSkills,

      experiences,

      educations:
        profile.educations,

      projects,
    };

    // ============================================================
    // 12. SAVE / UPDATE RESUME
    // ============================================================

    let resume;

    if (
      application.resumeId
    ) {
      resume =
        await this.prisma.resume.update({
          where: {
            id:
              application.resumeId,
          },

          data: {
            title:
              `CV - ${job.title}`,

            summary:
              generated.summary ??
              profile.summary,

            skills:
              safeSkills,

            content:
              JSON.parse(
                JSON.stringify(
                  resumeContent,
                ),
              ),

            status:
              'DRAFT',
          },
        });
    } else {
      resume =
        await this.prisma.resume.create({
          data: {
            jobId:
              job.id,

            title:
              `CV - ${job.title}`,

            summary:
              generated.summary ??
              profile.summary,

            skills:
              safeSkills,

            content:
              JSON.parse(
                JSON.stringify(
                  resumeContent,
                ),
              ),

            status:
              'DRAFT',
          },
        });

      await this.prisma.application.update({
        where: {
          id:
            application.id,
        },

        data: {
          resumeId:
            resume.id,
        },
      });
    }

    // ============================================================
    // 13. RETURN
    // ============================================================

    return {
      success: true,

      message:
        'CV personnalisé généré',

      application: {
        id:
          application.id,

        jobId:
          job.id,

        status:
          application.status,
      },

      resume: {
        id:
          resume.id,

        title:
          resume.title,

        status:
          resume.status,

        summary:
          resume.summary,

        skills:
          resume.skills,
      },

      targetJob: {
        title:
          job.title,

        company:
          job.company,

        score:
          analysis.score,

        matchedSkills:
          analysis.matchedSkills,

        missingSkills:
          analysis.missingSkills,
      },
    };
  }

  // ============================================================
  // OLLAMA
  // ============================================================

  private async callOllama(
    prompt: string,
  ): Promise<GeneratedResume> {
    const baseUrl =
      process.env
        .OLLAMA_BASE_URL ??
      'http://localhost:11434';

    const model =
      process.env.OLLAMA_MODEL;

    if (!model) {
      throw new Error(
        'OLLAMA_MODEL manquant',
      );
    }

    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {
      try {
        console.log(
          `[RESUME] Ollama ${attempt}/2`,
        );

        const response =
          await fetch(
            `${baseUrl}/api/chat`,
            {
              method:
                'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              signal:
                AbortSignal.timeout(
                  180000,
                ),

              body:
                JSON.stringify({
                  model,

                  stream:
                    false,

                  format:
                    'json',

                  think:
                    false,

                  options: {
                    temperature:
                      0,
                  },

                  messages: [
                    {
                      role:
                        'system',

                      content:
                        'Tu es un expert CV. Tu personnalises un CV uniquement à partir de faits réellement présents dans le profil candidat. Tu ne dois jamais inventer.',
                    },

                    {
                      role:
                        'user',

                      content:
                        prompt,
                    },
                  ],
                }),
            },
          );

        if (
          !response.ok
        ) {
          const errorText =
            await response.text();

          throw new Error(
            `Erreur Ollama : ${response.status} ${errorText}`,
          );
        }

        const data =
          (await response.json()) as OllamaResponse;

        const content =
          data.message?.content?.trim();

        if (!content) {
          throw new Error(
            "Ollama n'a retourné aucun CV",
          );
        }

        const parsed =
          JSON.parse(
            content,
          ) as GeneratedResume;

        return parsed;
      } catch (error) {
        lastError =
          error;

        console.error(
          `[RESUME] Échec ${attempt}/2`,
          error,
        );
      }
    }

    if (
      lastError instanceof Error
    ) {
      throw lastError;
    }

    throw new Error(
      'Impossible de générer le CV',
    );
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private cleanArray(
    values:
      | string[]
      | undefined,
  ): string[] {
    if (
      !Array.isArray(
        values,
      )
    ) {
      return [];
    }

    return Array.from(
      new Set(
        values
          .filter(
            (
              value,
            ) =>
              typeof value ===
              'string',
          )

          .map(
            (
              value,
            ) =>
              value.trim(),
          )

          .filter(
            Boolean,
          ),
      ),
    );
  }

  private normalize(
    value: string,
  ): string {
    return value
      .normalize(
        'NFD',
      )

      .replace(
        /[\u0300-\u036f]/g,
        '',
      )

      .toLowerCase()

      .replace(
        /[^a-z0-9+#.]+/g,
        ' ',
      )

      .trim();
  }

  private sameSkill(
    first: string,
    second: string,
  ): boolean {
    const a =
      this.normalize(
        first,
      );

    const b =
      this.normalize(
        second,
      );

    return (
      a === b ||
      a.includes(b) ||
      b.includes(a)
    );
  }
}