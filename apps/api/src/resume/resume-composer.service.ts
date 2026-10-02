import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type OllamaResponse = {
    message?: {
        content?: string;
    };
};

type ResumeSelection = {
    summary?: string;

    skillNames?: string[];

    experienceIds?: string[];

    experienceBulletSelections?: {
        experienceId: string;
        bulletIndexes: number[];
    }[];

    projectIds?: string[];

    educationIds?: string[];
};

@Injectable()
export class ResumeComposerService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async findOne(resumeId: string) {
        const resume =
            await this.prisma.resume.findUnique({
                where: {
                    id: resumeId,
                },

                include: {
                    job: {
                        include: {
                            analysis: true,
                        },
                    },
                },
            });

        if (!resume) {
            throw new Error(
                'CV introuvable',
            );
        }

        return resume;
    }

    // ============================================================
    // GENERATE
    // ============================================================
    private normalizeEducationText(
        value: string | null | undefined,
    ): string {
        return (value ?? '')
            .normalize('NFD')
            .replace(
                /[\u0300-\u036f]/g,
                '',
            )
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                ' ',
            )
            .replace(
                /\b(en|de|du|des|et)\b/g,
                ' ',
            )
            .replace(/\s+/g, ' ')
            .trim();
    }

    async generate(jobId: string) {
        // ----------------------------------------------------------
        // 1. Offre
        // ----------------------------------------------------------

        const job =
            await this.prisma.job.findUnique({
                where: {
                    id: jobId,
                },

                include: {
                    analysis: true,
                },
            });

        if (!job) {
            throw new Error(
                'Offre introuvable',
            );
        }

        // ----------------------------------------------------------
        // 2. Profil candidat
        // ----------------------------------------------------------

        const profile =
            await this.prisma.candidateProfile.findFirst({
                include: {
                    experiences: true,
                    educations: true,
                    skills: true,
                    projects: true,
                },
            });

        if (!profile) {
            throw new Error(
                'Profil candidat introuvable',
            );
        }

        // ----------------------------------------------------------
        // 3. Sélection IA
        // ----------------------------------------------------------

        const selection =
            await this.selectResumeContent(
                job,
                profile,
            );

        // ----------------------------------------------------------
        // 4. Validation stricte des compétences
        // ----------------------------------------------------------

        const allowedSkills =
            new Map(
                profile.skills.map((skill) => [
                    skill.name.toLowerCase(),
                    skill,
                ]),
            );

        const aiSelectedSkills =
            (selection.skillNames ?? [])
                .map((name) =>
                    allowedSkills.get(
                        name.trim().toLowerCase(),
                    ),
                )
                .filter(
                    (
                        skill,
                    ): skill is NonNullable<
                        typeof skill
                    > => Boolean(skill),
                );

        // ============================================================
        // FALLBACK DETERMINISTE
        // Si Ollama oublie une compétence, on compare directement
        // les compétences réelles du profil avec l'analyse de l'offre.
        // ============================================================

        const targetSkills = Array.from(
            new Set([
                ...(job.analysis?.requiredSkills ?? []),
                ...(job.analysis?.optionalSkills ?? []),
                ...(job.analysis?.technologies ?? []),
            ]),
        );

        const deterministicSkills =
            profile.skills.filter((skill) =>
                targetSkills.some((target) =>
                    this.skillsMatch(
                        skill.name,
                        target,
                    ),
                ),
            );

        // Union IA + matching déterministe
        const selectedSkills = Array.from(
            new Map(
                [
                    ...aiSelectedSkills,
                    ...deterministicSkills,
                ].map((skill) => [
                    skill.id,
                    skill,
                ]),
            ).values(),
        );
        // ----------------------------------------------------------
        // 5. Validation des expériences
        // ----------------------------------------------------------

        const experienceIds =
            new Set(
                selection.experienceIds ?? [],
            );

        const bulletSelections =
            new Map<
                string,
                number[]
            >();

        for (
            const item
            of selection.experienceBulletSelections ??
            []
        ) {
            bulletSelections.set(
                item.experienceId,
                item.bulletIndexes ?? [],
            );
        }

        const selectedExperiences =
            profile.experiences
                .filter((experience) =>
                    experienceIds.has(
                        experience.id,
                    ),
                )
                .map((experience) => {
                    const indexes =
                        bulletSelections.get(
                            experience.id,
                        ) ?? [];

                    const selectedBullets =
                        this.selectRelevantBullets(
                            experience.bullets,
                            targetSkills,
                            indexes,
                        );

                    return {
                        id: experience.id,

                        company:
                            experience.company,

                        title:
                            experience.title,

                        location:
                            experience.location,

                        startDate:
                            experience.startDate
                                ?.toISOString() ??
                            null,

                        endDate:
                            experience.endDate
                                ?.toISOString() ??
                            null,

                        current:
                            experience.current,

                        description:
                            experience.description,

                        bullets:
                            this.selectRelevantBullets(
                                experience.bullets,
                                targetSkills,
                            ),
                    };
                });

        // ----------------------------------------------------------
        // 6. Validation des projets
        // ----------------------------------------------------------
        // ----------------------------------------------------------
        // 6. Validation + fallback déterministe des projets
        // ----------------------------------------------------------

        const projectIds = new Set(
            selection.projectIds ?? [],
        );

        // Projets choisis par Ollama
        const aiSelectedProjects =
            profile.projects.filter((project) =>
                projectIds.has(project.id),
            );

        // Fallback déterministe :
        // vérifier si les technologies du projet correspondent
        // aux compétences/technologies recherchées par l'offre.
        const deterministicProjects =
            profile.projects.filter((project) => {
                return targetSkills.some(
                    (targetSkill) => {
                        // Match sur les technologies du projet
                        const technologyMatch =
                            project.technologies.some(
                                (technology) =>
                                    this.skillsMatch(
                                        technology,
                                        targetSkill,
                                    ),
                            );

                        if (technologyMatch) {
                            return true;
                        }

                        // Match éventuel sur le nom du projet
                        if (
                            this.skillsMatch(
                                project.name,
                                targetSkill,
                            )
                        ) {
                            return true;
                        }

                        return false;
                    },
                );
            });

        // Fusion IA + fallback sans doublon
        const relevantProjects = Array.from(
            new Map(
                [
                    ...aiSelectedProjects,
                    ...deterministicProjects,
                ].map((project) => [
                    project.id,
                    project,
                ]),
            ).values(),
        );

        // Format final stocké dans le CV
        const selectedProjects =
            relevantProjects.map((project) => ({
                id: project.id,

                name: project.name,

                description:
                    project.description,

                technologies:
                    project.technologies,

                startDate:
                    project.startDate
                        ?.toISOString() ??
                    null,

                endDate:
                    project.endDate
                        ?.toISOString() ??
                    null,

                url:
                    project.url ?? null,
            }));

        // ----------------------------------------------------------
        // 7. Validation formations
        // ----------------------------------------------------------

        const educationIds =
            new Set(
                selection.educationIds ?? [],
            );

        const selectedEducations =
            profile.educations
                .filter((education) =>
                    educationIds.has(
                        education.id,
                    ),
                )
                .map((education) => ({
                    id:
                        education.id,

                    school:
                        education.school,

                    degree:
                        education.degree,

                    field:
                        education.field,

                    startDate:
                        education.startDate
                            ?.toISOString() ??
                        null,

                    endDate:
                        education.endDate
                            ?.toISOString() ??
                        null,

                    description:
                        education.description,
                }));

        // ----------------------------------------------------------
        // 8. Fallback si l'IA oublie une section
        // ----------------------------------------------------------


        const educationSource =
            selectedEducations.length > 0
                ? selectedEducations
                : profile.educations.map(
                    (education) => ({
                        id: education.id,

                        school: education.school,

                        degree: education.degree,

                        field: education.field,

                        startDate:
                            education.startDate
                                ?.toISOString() ??
                            null,

                        endDate:
                            education.endDate
                                ?.toISOString() ??
                            null,

                        description:
                            education.description,
                    }),
                );

        const finalEducations: typeof educationSource =
            [];

        for (const education of educationSource) {
            const school =
                this.normalizeEducationText(
                    education.school,
                );

            const degree =
                this.normalizeEducationText(
                    education.degree,
                );

            const field =
                this.normalizeEducationText(
                    education.field,
                );

            const duplicate =
                finalEducations.some(
                    (existing) => {
                        const existingSchool =
                            this.normalizeEducationText(
                                existing.school,
                            );

                        const existingDegree =
                            this.normalizeEducationText(
                                existing.degree,
                            );

                        const existingField =
                            this.normalizeEducationText(
                                existing.field,
                            );

                        const sameSchool =
                            school === existingSchool;

                        const similarDegree =
                            degree.includes(
                                existingDegree,
                            ) ||
                            existingDegree.includes(
                                degree,
                            );

                        const similarField =
                            field.includes(
                                existingField,
                            ) ||
                            existingField.includes(
                                field,
                            );

                        return (
                            sameSchool &&
                            similarDegree &&
                            similarField
                        );
                    },
                );

            if (!duplicate) {
                finalEducations.push(
                    education,
                );
            }
        }

        // ============================================================
        // EXPERIENCES FINALES
        // ============================================================

        const deterministicExperiences =
            profile.experiences.filter((experience) => {
                const experienceText = [
                    experience.title,
                    experience.description,
                    ...experience.bullets,
                ]
                    .filter(Boolean)
                    .join(' ');

                return targetSkills.some((targetSkill) =>
                    this.textContainsSkill(
                        experienceText,
                        targetSkill,
                    ),
                );
            });

        const deterministicFormatted =
            deterministicExperiences.map((experience) => ({
                id: experience.id,

                company: experience.company,

                title: experience.title,

                location: experience.location,

                startDate:
                    experience.startDate?.toISOString() ??
                    null,

                endDate:
                    experience.endDate?.toISOString() ??
                    null,

                current: experience.current,

                description:
                    experience.description,

                bullets: this.selectRelevantBullets(
                    experience.bullets,
                    targetSkills,
                ),
            }));

        const relevantExperiences = Array.from(
            new Map(
                [
                    ...selectedExperiences,
                    ...deterministicFormatted,
                ].map((experience) => [
                    experience.id,
                    experience,
                ]),
            ).values(),
        );

        const finalExperiences =
            relevantExperiences.length > 0
                ? relevantExperiences.slice(0, 4)
                : profile.experiences
                    .slice(0, 3)
                    .map((experience) => ({
                        id: experience.id,

                        company:
                            experience.company,

                        title:
                            experience.title,

                        location:
                            experience.location,

                        startDate:
                            experience.startDate
                                ?.toISOString() ??
                            null,

                        endDate:
                            experience.endDate
                                ?.toISOString() ??
                            null,

                        current:
                            experience.current,

                        description:
                            experience.description,

                        bullets: this.selectRelevantBullets(
                            experience.bullets,
                            targetSkills,
                        ),
                    }));

        // ----------------------------------------------------------
        // 9. Content JSON du CV
        // ----------------------------------------------------------

        const content = {
            candidate: {
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

                github:
                    profile.github,

                linkedin:
                    profile.linkedin,
            },

            targetJob: {
                id: job.id,

                title:
                    job.title,

                company:
                    job.company,

                location:
                    job.location,

                source:
                    job.source,

                compatibilityScore:
                    job.analysis?.score ??
                    null,
            },

            summary:
                selection.summary ??
                profile.summary ??
                null,

            skills:
                selectedSkills.map(
                    (skill) => ({
                        name:
                            skill.name,

                        category:
                            skill.category,

                        level:
                            skill.level,
                    }),
                ),

            experiences:
                finalExperiences,

            projects:
                selectedProjects,

            educations:
                finalEducations,
        };

        // ----------------------------------------------------------
        // 10. Sauvegarde
        // ----------------------------------------------------------

        const resume =
            await this.prisma.resume.create({
                data: {
                    jobId:
                        job.id,

                    title:
                        profile.headline ??
                        'Développeur Full-Stack',

                    summary:
                        selection.summary ??
                        profile.summary ??
                        null,

                    skills:
                        selectedSkills.map(
                            (skill) =>
                                skill.name,
                        ),

                    content,

                    status:
                        'DRAFT',
                },
            });

        return {
            job: {
                id:
                    job.id,

                title:
                    job.title,

                company:
                    job.company,

                score:
                    job.analysis?.score ??
                    null,
            },

            resume,
        };
    }

    // ============================================================
    // IA
    // ============================================================

    private async selectResumeContent(
        job: any,
        profile: any,
    ): Promise<ResumeSelection> {
        const baseUrl =
            process.env.OLLAMA_BASE_URL ??
            'http://localhost:11434';

        const model =
            process.env.OLLAMA_MODEL;

        if (!model) {
            throw new Error(
                'OLLAMA_MODEL manquant',
            );
        }

        // ----------------------------------------------------------
        // Expériences
        // ----------------------------------------------------------

        const experiences =
            profile.experiences.map(
                (experience: any) => ({
                    id:
                        experience.id,

                    company:
                        experience.company,

                    title:
                        experience.title,

                    description:
                        experience.description,

                    bullets:
                        experience.bullets.map(
                            (
                                bullet: string,
                                index: number,
                            ) => ({
                                index,
                                text:
                                    bullet,
                            }),
                        ),
                }),
            );

        // ----------------------------------------------------------
        // Skills
        // ----------------------------------------------------------

        const skills =
            profile.skills.map(
                (skill: any) => ({
                    name:
                        skill.name,

                    category:
                        skill.category,

                    level:
                        skill.level,
                }),
            );

        // ----------------------------------------------------------
        // Projects
        // ----------------------------------------------------------

        const projects =
            profile.projects.map(
                (project: any) => ({
                    id:
                        project.id,

                    name:
                        project.name,

                    description:
                        project.description,

                    technologies:
                        project.technologies,
                }),
            );

        // ----------------------------------------------------------
        // Education
        // ----------------------------------------------------------

        const educations =
            profile.educations.map(
                (education: any) => ({
                    id:
                        education.id,

                    school:
                        education.school,

                    degree:
                        education.degree,

                    field:
                        education.field,
                }),
            );

        // ----------------------------------------------------------
        // Prompt
        // ----------------------------------------------------------

        const prompt = `
Tu dois préparer la sélection de contenu
d'un CV personnalisé pour une offre.

RÈGLE ABSOLUE :

Tu ne dois JAMAIS inventer :

- une entreprise
- une expérience
- une compétence
- une technologie
- une formation
- un projet
- une date
- une mission
- une responsabilité
- un nombre d'années d'expérience

Tu peux uniquement sélectionner
les informations fournies ci-dessous.

Pour les expériences :

- utilise uniquement les experienceId existants.
- pour les bullets, retourne uniquement les index existants.
- ne réécris pas les bullets.
- ne crée aucun bullet.

Pour les compétences :

- utilise exactement les noms présents dans SKILLS.
- sélectionne principalement les compétences pertinentes pour l'offre.
- ne sélectionne pas une compétence uniquement pour augmenter artificiellement le score.

Pour les projets :

- utilise uniquement les projectId fournis.

Pour les formations :

- utilise uniquement les educationId fournis.

Pour le résumé :
- rédige 3 phrases maximum.
- rédige obligatoirement en français.
- utilise uniquement des faits explicitement présents dans le profil.
- n'utilise jamais les mots "passionné", "expert", "expertise", "solide expérience", "vision stratégique" ou toute formulation subjective sauf si elle existe déjà dans le profil.
- ne prétends jamais que le candidat maîtrise une compétence absente de son profil.
- adapte le résumé aux technologies de l'offre uniquement lorsqu'elles existent réellement dans le profil candidat.
- si une technologie demandée est absente du profil, ne la mentionne pas comme compétence du candidat.
- n'invente aucune durée d'expérience.
- privilégie un résumé factuel, professionnel et ATS-friendly.

Retourne uniquement du JSON valide.

FORMAT :

{
  "summary": "",
  "skillNames": [],
  "experienceIds": [],
  "experienceBulletSelections": [
    {
      "experienceId": "",
      "bulletIndexes": []
    }
  ],
  "projectIds": [],
  "educationIds": []
}


==================================================
OFFRE
==================================================

Titre :
${job.title}

Entreprise :
${job.company ?? 'Non renseignée'}

Description :
${job.description ?? 'Non renseignée'}

Compétences requises :
${JSON.stringify(
            job.analysis?.requiredSkills ??
            [],
        )}

Compétences optionnelles :
${JSON.stringify(
            job.analysis?.optionalSkills ??
            [],
        )}

Technologies :
${JSON.stringify(
            job.analysis?.technologies ??
            [],
        )}


==================================================
PROFIL
==================================================

Titre candidat :
${profile.headline ?? ''}

Résumé :
${profile.summary ?? ''}


SKILLS :

${JSON.stringify(
            skills,
            null,
            2,
        )}


EXPERIENCES :

${JSON.stringify(
            experiences,
            null,
            2,
        )}


PROJECTS :

${JSON.stringify(
            projects,
            null,
            2,
        )}


EDUCATION :

${JSON.stringify(
            educations,
            null,
            2,
        )}
`;

        const data =
            await this.callOllama(
                baseUrl,
                model,
                prompt,
            );

        const content =
            data.message?.content?.trim();

        if (!content) {
            throw new Error(
                'Réponse Ollama vide',
            );
        }

        return JSON.parse(
            content,
        ) as ResumeSelection;
    }

    // ============================================================
    // OLLAMA
    // ============================================================
    private selectRelevantBullets(
        bullets: string[],
        targetSkills: string[],
        aiIndexes: number[] = [],
    ): string[] {
        if (bullets.length === 0) {
            return [];
        }

        const scoredBullets = bullets.map(
            (bullet, index) => {
                const matches = targetSkills.filter(
                    (skill) =>
                        this.textContainsSkill(
                            bullet,
                            skill,
                        ),
                ).length;

                return {
                    bullet,
                    index,
                    score: matches,
                };
            },
        );

        // D'abord les bullets qui correspondent réellement à l'offre
        const relevant = scoredBullets
            .filter((item) => item.score > 0)
            .sort(
                (a, b) =>
                    b.score - a.score,
            );

        const result: string[] = [];

        for (const item of relevant) {
            if (!result.includes(item.bullet)) {
                result.push(item.bullet);
            }

            if (result.length >= 4) {
                return result;
            }
        }

        // Ensuite la sélection faite par l'IA,
        // uniquement avec des index réellement existants.
        for (const index of aiIndexes) {
            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index < bullets.length
            ) {
                const bullet = bullets[index];

                if (!result.includes(bullet)) {
                    result.push(bullet);
                }
            }

            if (result.length >= 4) {
                return result;
            }
        }

        // Fallback final : vraies lignes existantes uniquement
        for (const bullet of bullets) {
            if (!result.includes(bullet)) {
                result.push(bullet);
            }

            if (result.length >= 4) {
                break;
            }
        }

        return result;
    }
    private skillsMatch(
        candidateSkill: string,
        jobSkill: string,
    ): boolean {
        const normalize = (
            value: string,
        ) =>
            value
                .normalize('NFD')
                .replace(
                    /[\u0300-\u036f]/g,
                    '',
                )
                .toLowerCase()
                .replace(
                    /[^a-z0-9+#]+/g,
                    ' ',
                )
                .trim();

        const candidate =
            normalize(candidateSkill);

        const searched =
            normalize(jobSkill);

        if (!candidate || !searched) {
            return false;
        }

        if (
            candidate === searched ||
            candidate.includes(searched) ||
            searched.includes(candidate)
        ) {
            return true;
        }

        const aliases: Record<
            string,
            string[]
        > = {
            react: [
                'react',
                'react js',
                'reactjs',
            ],

            node: [
                'node',
                'node js',
                'nodejs',
            ],

            postgresql: [
                'postgresql',
                'postgres',
            ],

            javascript: [
                'javascript',
                'js',
            ],

            typescript: [
                'typescript',
                'ts',
            ],

            nestjs: [
                'nestjs',
                'nest',
            ],

            nextjs: [
                'nextjs',
                'next js',
            ],
        };

        for (const values of Object.values(
            aliases,
        )) {
            if (
                values.includes(candidate) &&
                values.includes(searched)
            ) {
                return true;
            }
        }

        return false;
    }
    private textContainsSkill(
        text: string,
        skill: string,
    ): boolean {
        const normalize = (
            value: string,
        ): string =>
            value
                .normalize('NFD')
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

        const normalizedText =
            normalize(text);

        const normalizedSkill =
            normalize(skill);

        if (!normalizedSkill) {
            return false;
        }

        // Correspondance directe
        if (
            normalizedText.includes(
                normalizedSkill,
            )
        ) {
            return true;
        }

        // Alias
        const aliases: Record<
            string,
            string[]
        > = {
            react: [
                'react',
                'reactjs',
                'react.js',
            ],

            'node.js': [
                'node',
                'nodejs',
                'node.js',
            ],

            node: [
                'node',
                'nodejs',
                'node.js',
            ],

            nextjs: [
                'nextjs',
                'next.js',
            ],

            nestjs: [
                'nestjs',
                'nest',
            ],

            postgresql: [
                'postgresql',
                'postgres',
            ],

            javascript: [
                'javascript',
                'js',
            ],

            typescript: [
                'typescript',
                'ts',
            ],

            python: [
                'python',
            ],

            angular: [
                'angular',
                'angularjs',
            ],

            azure: [
                'azure',
                'microsoft azure',
            ],
        };

        const possibleValues =
            aliases[normalizedSkill] ??
            [normalizedSkill];

        return possibleValues.some(
            (value) =>
                normalizedText.includes(value),
        );
    }

    private async callOllama(
        baseUrl: string,
        model: string,
        prompt: string,
    ): Promise<OllamaResponse> {
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
                            method: 'POST',

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

                                    stream: false,

                                    format: 'json',

                                    think: false,

                                    options: {
                                        temperature: 0,
                                    },

                                    messages: [
                                        {
                                            role:
                                                'system',

                                            content:
                                                "Tu personnalises un CV sans jamais inventer d'information.",
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

                if (!response.ok) {
                    throw new Error(
                        `Ollama HTTP ${response.status}`,
                    );
                }

                const data =
                    (await response.json()) as OllamaResponse;

                const content =
                    data.message?.content;

                if (!content) {
                    throw new Error(
                        'Réponse vide',
                    );
                }

                // Vérifier que le JSON est valide
                JSON.parse(content);

                return data;
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
            'Erreur génération CV',
        );
    }
}