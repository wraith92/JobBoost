import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

type OllamaResponse = {
  message?: {
    content?: string;
  };
};

type JobExtraction = {
  requiredSkills?: string[];
  optionalSkills?: string[];
  technologies?: string[];

  seniority?: string | null;

  // Le LLM doit normalement retourner un number,
  // mais on accepte aussi string par sécurité.
  minYearsExperience?: number | string | null;

  remote?: string | null;
  salarySummary?: string | null;

  summary?: string | null;
};

@Injectable()
export class JobAnalyzerService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async analyze(jobId: string) {
    // ============================================================
    // 1. RÉCUPÉRER L'OFFRE
    // ============================================================

    const job =
      await this.prisma.job.findUnique({
        where: {
          id: jobId,
        },
      });

    if (!job) {
      throw new Error(
        'Offre introuvable',
      );
    }

    // ============================================================
    // 2. RÉCUPÉRER LE PROFIL CANDIDAT
    // ============================================================

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

    // ============================================================
    // 3. CONSTRUIRE LA SOURCE DE VÉRITÉ CANDIDAT
    // ============================================================

    const candidateText = [
      profile.headline,
      profile.summary,

      ...profile.skills.map(
        (skill) => skill.name,
      ),

      ...profile.experiences.flatMap(
        (experience) => [
          experience.title,
          experience.description,
          ...experience.bullets,
        ],
      ),

      ...profile.projects.flatMap(
        (project) => [
          project.name,
          project.description,
          ...project.technologies,
        ],
      ),

      ...profile.educations.flatMap(
        (education) => [
          education.degree,
          education.field,
          education.description,
        ],
      ),
    ]
      .filter(Boolean)
      .join('\n');

    // ============================================================
    // 4. EXTRACTION DE L'OFFRE PAR OLLAMA
    // ============================================================

    const extraction =
      await this.extractJobRequirements(
        job,
      );

    const requiredSkills =
      this.cleanArray(
        extraction.requiredSkills,
      );

    const optionalSkills =
      this.cleanArray(
        extraction.optionalSkills,
      );

    const technologies =
      this.cleanArray(
        extraction.technologies,
      );

    const remote =
      this.normalizeRemote(
        extraction.remote,
      );

    const minYearsExperience =
      this.normalizeMinYearsExperience(
        extraction.minYearsExperience,
      );

    // ============================================================
    // 5. MATCHING DÉTERMINISTE
    // ============================================================
    //
    // Ollama analyse l'offre.
    // Mais Ollama ne décide PAS si le candidat possède
    // une compétence.
    //
    // Le matching est réalisé ici à partir du profil réel.
    // ============================================================

    const matchedRequiredSkills =
      requiredSkills.filter(
        (skill) =>
          this.candidateHasSkill(
            candidateText,
            skill,
          ),
      );

    const matchedOptionalSkills =
      optionalSkills.filter(
        (skill) =>
          this.candidateHasSkill(
            candidateText,
            skill,
          ),
      );

    const matchedTechnologies =
      technologies.filter(
        (technology) =>
          this.candidateHasSkill(
            candidateText,
            technology,
          ),
      );

    const matchedSkills =
      Array.from(
        new Set([
          ...matchedRequiredSkills,
          ...matchedOptionalSkills,
          ...matchedTechnologies,
        ]),
      );

    const missingSkills =
      requiredSkills.filter(
        (skill) =>
          !this.candidateHasSkill(
            candidateText,
            skill,
          ),
      );

    // ============================================================
    // 6. SCORE V3
    // ============================================================
    //
    // Compétences requises : 45 %
    // Technologies         : 25 %
    // Compétences bonus    : 10 %
    // Expérience           : 15 %
    // Localisation/remote  : 5 %
    //
    // Le niveau skill 1..5 ne pénalise plus automatiquement
    // une compétence réellement présente dans le CV.
    // ============================================================

    const requiredRatio =
      requiredSkills.length > 0
        ? matchedRequiredSkills.length /
          requiredSkills.length
        : null;

    const technologyRatio =
      technologies.length > 0
        ? matchedTechnologies.length /
          technologies.length
        : null;

    const optionalRatio =
      optionalSkills.length > 0
        ? matchedOptionalSkills.length /
          optionalSkills.length
        : null;

    // ------------------------------------------------------------
    // Expérience réelle du candidat
    // ------------------------------------------------------------

    const candidateYears =
      this.candidateExperienceYears(
        profile.experiences,
      );

    let experienceRatio:
      | number
      | null;

    // Si l'annonce dit explicitement :
    // "3 ans minimum", "5 ans", etc.
    if (
      minYearsExperience !== null
    ) {
      experienceRatio =
        this.experienceScore(
          minYearsExperience,
          candidateYears,
        );
    } else {
      // Sinon fallback sur junior / confirmé / senior
      experienceRatio =
        this.seniorityScore(
          extraction.seniority,
          candidateYears,
        );
    }

    const locationRatio =
      this.locationScore(
        job.location,
        remote,
        profile.location,
      );

    const scoreParts = [
      {
        ratio: requiredRatio,
        weight: 45,
      },
      {
        ratio: technologyRatio,
        weight: 25,
      },
      {
        ratio: optionalRatio,
        weight: 10,
      },
      {
        ratio: experienceRatio,
        weight: 15,
      },
      {
        ratio: locationRatio,
        weight: 5,
      },
    ].filter(
      (
        part,
      ): part is {
        ratio: number;
        weight: number;
      } => part.ratio !== null,
    );

    const totalWeight =
      scoreParts.reduce(
        (total, part) =>
          total + part.weight,
        0,
      );

    const weightedScore =
      scoreParts.reduce(
        (total, part) =>
          total +
          part.ratio *
            part.weight,
        0,
      );

    const score =
      totalWeight > 0
        ? Math.round(
            (weightedScore /
              totalWeight) *
              100,
          )
        : 0;

    // ============================================================
    // LOGS SCORE V3
    // ============================================================

    console.log(
      '=== SCORE V3 ===',
    );

    console.log(
      'Required:',
      matchedRequiredSkills.length,
      '/',
      requiredSkills.length,
      '=>',
      requiredRatio,
    );

    console.log(
      'Technologies:',
      matchedTechnologies.length,
      '/',
      technologies.length,
      '=>',
      technologyRatio,
    );

    console.log(
      'Optional:',
      matchedOptionalSkills.length,
      '/',
      optionalSkills.length,
      '=>',
      optionalRatio,
    );

    console.log(
      'Candidate experience:',
      candidateYears,
      'years',
    );

    console.log(
      'Required experience:',
      minYearsExperience,
    );

    console.log(
      'Experience ratio:',
      experienceRatio,
    );

    console.log(
      'Location ratio:',
      locationRatio,
    );

    console.log(
      'Score:',
      score,
    );

    console.log(
      '================',
    );

    // ============================================================
    // 7. SAUVEGARDER JOB ANALYSIS
    // ============================================================

    const analysis =
      await this.prisma.jobAnalysis.upsert({
        where: {
          jobId: job.id,
        },

        update: {
          requiredSkills,
          optionalSkills,
          technologies,

          seniority:
            extraction.seniority ??
            null,

          remote,

          salarySummary:
            extraction.salarySummary ??
            null,

          matchedSkills,
          missingSkills,

          score,

          summary:
            extraction.summary ??
            null,
        },

        create: {
          jobId: job.id,

          requiredSkills,
          optionalSkills,
          technologies,

          seniority:
            extraction.seniority ??
            null,

          remote,

          salarySummary:
            extraction.salarySummary ??
            null,

          matchedSkills,
          missingSkills,

          score,

          summary:
            extraction.summary ??
            null,
        },
      });

    // ============================================================
    // 8. DÉTAIL DU SCORE POUR N8N
    // ============================================================

    const scoreBreakdown = {
      requiredSkills:
        requiredRatio !== null
          ? Math.round(
              requiredRatio * 100,
            )
          : null,

      technologies:
        technologyRatio !== null
          ? Math.round(
              technologyRatio * 100,
            )
          : null,

      optionalSkills:
        optionalRatio !== null
          ? Math.round(
              optionalRatio * 100,
            )
          : null,

      experience:
        experienceRatio !== null
          ? Math.round(
              experienceRatio * 100,
            )
          : null,

      location:
        locationRatio !== null
          ? Math.round(
              locationRatio * 100,
            )
          : null,

      candidateYears:
        Math.round(
          candidateYears * 10,
        ) / 10,

      minYearsExperience,
    };

    return {
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        source: job.source,
      },

      analysis,

      scoreBreakdown,
    };
  }

  // ============================================================
  // OLLAMA
  // ============================================================

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
          `[OLLAMA] Tentative ${attempt}/2`,
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

              // 3 minutes maximum
              signal:
                AbortSignal.timeout(
                  180000,
                ),

              body: JSON.stringify({
                model,

                stream: false,

                format: 'json',

                // Qwen3 :
                // pas besoin de raisonnement long
                think: false,

                options: {
                  temperature: 0,
                },

                messages: [
                  {
                    role: 'system',

                    content:
                      "Tu es un analyseur d'offres d'emploi. " +
                      "Tu extrais uniquement les informations réellement " +
                      "présentes dans l'annonce. " +
                      "Tu ne dois jamais inventer.",
                  },

                  {
                    role: 'user',
                    content: prompt,
                  },
                ],
              }),
            },
          );

        if (!response.ok) {
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
            "Ollama n'a retourné aucun contenu.",
          );
        }

        // Vérifie que le contenu est bien du JSON
        // avant de considérer la tentative comme réussie.
        try {
          JSON.parse(content);
        } catch {
          console.error(
            '[OLLAMA] JSON incomplet/invalide :',
            content,
          );

          throw new Error(
            'Ollama a retourné un JSON invalide.',
          );
        }

        console.log(
          `[OLLAMA] Tentative ${attempt} réussie`,
        );

        return data;
      } catch (error) {
        lastError = error;

        console.error(
          `[OLLAMA] Échec tentative ${attempt}/2 :`,
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
      'Impossible de contacter Ollama.',
    );
  }

  // ============================================================
  // EXTRACTION DES INFORMATIONS DE L'OFFRE
  // ============================================================

  private async extractJobRequirements(
    job: {
      title: string;
      company: string | null;
      description: string | null;
      location: string | null;
      contractType: string | null;
      salary: string | null;
    },
  ): Promise<JobExtraction> {
    const baseUrl =
      process.env
        .OLLAMA_BASE_URL ??
      'http://localhost:11434';

    const model =
      process.env.OLLAMA_MODEL;

    if (!model) {
      throw new Error(
        'OLLAMA_MODEL manquant dans apps/api/.env',
      );
    }

    const cleanDescription =
      this.cleanDescription(
        job.description ?? '',
      );

    const prompt = `
Analyse cette offre d'emploi.

RÈGLES IMPORTANTES :

- Analyse le titre ET l'intégralité de la description de l'offre.

- Utilise uniquement les informations réellement présentes dans l'offre.

- N'invente aucune compétence.

- N'invente aucune technologie.

- Si une information est absente, utilise [] ou null.


COMPÉTENCES REQUISES :

- requiredSkills doit contenir UNIQUEMENT des compétences réellement nécessaires au candidat.

- Chaque élément doit être une compétence courte et atomique.

- Une compétence doit idéalement faire entre 1 et 5 mots.

- Utilise des noms de compétences, technologies ou domaines.

Exemples corrects :

"Python"
"SQL"
"Node.js"
"API REST"
"Machine Learning"
"automatisation"
"développement web"
"bases de données"
"Data Science"

NE METS JAMAIS UNE MISSION COMPLÈTE DANS requiredSkills.

Exemples interdits :

"développer des outils internes"

"accompagner les équipes dans l'utilisation des outils"

"participer à la digitalisation de l'entreprise"

"assurer la maintenance des applications"

"développer des automatisations et des échanges de données via API"

Dans ces exemples, extrais uniquement les compétences réellement identifiables.

Exemple :

"développer des automatisations et des échanges de données via API"

peut devenir :

"automatisation"
"API REST"

si ces compétences sont réellement nécessaires.


MISSIONS VS COMPÉTENCES :

- Une responsabilité ou une mission n'est PAS automatiquement une compétence.

- Une technologie explicitement utilisée pour réaliser les missions peut être considérée comme requise.

Exemple :

"Vous développerez les interfaces avec React"

=> requiredSkills contient :

"React"


"Le backend repose sur Node.js"

=> requiredSkills contient :

"Node.js"


"Vous travaillerez avec PostgreSQL"

=> requiredSkills contient :

"PostgreSQL"


OPTIONAL SKILLS :

- optionalSkills contient uniquement les compétences indiquées comme :

  appréciées,
  souhaitées,
  facultatives,
  bonus,
  "un plus".

- Les compétences optionnelles doivent également être atomiques.

Exemple :

"Python et SQL seraient appréciés"

=> optionalSkills :

[
  "Python",
  "SQL"
]


TECHNOLOGIES :

- technologies contient uniquement des technologies concrètes :

  langages,
  frameworks,
  bases de données,
  services cloud,
  plateformes,
  outils techniques.

- Une technologie centrale apparaissant dans le titre ou dans les missions peut être présente à la fois dans requiredSkills et technologies.

- Ne considère pas comme requise une technologie simplement mentionnée dans la présentation générale de l'entreprise si elle n'est pas liée aux missions ou au profil recherché.


SÉNIORITÉ :

- seniority = "junior", "confirmé", "senior", "lead", etc. uniquement si cela est réellement identifiable.

- Sinon utilise null.


EXPÉRIENCE :

- minYearsExperience doit contenir un NOMBRE uniquement si l'annonce indique explicitement un nombre d'années d'expérience demandé.

Exemples :

"3 ans d'expérience minimum"
=> 3

"au moins 5 ans"
=> 5

"2 années d'expérience"
=> 2

"une première expérience est appréciée"
=> null

"profil confirmé"
=> null

"expérience significative"
=> null


TÉLÉTRAVAIL :

- remote doit toujours être une chaîne de caractères ou null.

- Ne retourne jamais true ou false pour remote.

Exemples :

"Hybride"

"Télétravail possible"

"100% remote"

"2 jours par semaine"

null


SALAIRE :

- salarySummary = salaire uniquement s'il apparaît dans l'offre.

- Sinon null.


RÉSUMÉ :

- summary = résumé très court de l'offre obligatoirement en français.


FORMAT :

- Retourne uniquement du JSON valide.

- N'ajoute aucun texte avant ou après le JSON.

{
  "requiredSkills": [],
  "optionalSkills": [],
  "technologies": [],
  "seniority": null,
  "minYearsExperience": null,
  "remote": null,
  "salarySummary": null,
  "summary": null
}


OFFRE :

Titre :
${job.title}

Entreprise :
${job.company ?? 'Non renseignée'}

Lieu :
${job.location ?? 'Non renseigné'}

Contrat :
${job.contractType ?? 'Non renseigné'}

Salaire :
${job.salary ?? 'Non renseigné'}

Description :
${cleanDescription || 'Non renseignée'}
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
        "Ollama n'a retourné aucune analyse.",
      );
    }

    return JSON.parse(
      content,
    ) as JobExtraction;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private cleanArray(
    values?: string[],
  ): string[] {
    if (!Array.isArray(values)) {
      return [];
    }

    return Array.from(
      new Set(
        values
          .filter(
            (value) =>
              typeof value ===
              'string',
          )
          .map(
            (value) =>
              value.trim(),
          )
          .filter(Boolean),
      ),
    );
  }

  // ============================================================
  // MATCHING COMPÉTENCE
  // ============================================================

  private candidateHasSkill(
    candidateText: string,
    skill: string,
  ): boolean {
    const candidate =
      this.normalize(
        candidateText,
      );

    const searched =
      this.normalize(skill);

    if (!searched) {
      return false;
    }

    const contains = (
      value: string,
    ): boolean => {
      const normalized =
        this.normalize(value);

      if (!normalized) {
        return false;
      }

      if (
        candidate === normalized
      ) {
        return true;
      }

      return (
        ` ${candidate} `.includes(
          ` ${normalized} `,
        )
      );
    };

    const canonical =
      this.canonicalSkill(
        searched,
      );

    // ============================================================
    // CLOUD PROVIDERS
    // Azure != AWS != GCP
    // ============================================================

    if (
      canonical ===
      'google cloud'
    ) {
      return [
        'google cloud',
        'google cloud platform',
        'gcp',
      ].some(contains);
    }

    if (
      canonical === 'azure'
    ) {
      return [
        'azure',
        'microsoft azure',
      ].some(contains);
    }

    if (
      canonical === 'aws'
    ) {
      return [
        'aws',
        'amazon web services',
      ].some(contains);
    }

    // ============================================================
    // ALIASES TECHNIQUES
    // ============================================================

    const aliases: Record<
      string,
      string[]
    > = {
      react: [
        'react',
        'reactjs',
        'react.js',
      ],

      node: [
        'node',
        'nodejs',
        'node.js',
      ],

      nestjs: [
        'nestjs',
        'nest',
      ],

      nextjs: [
        'nextjs',
        'next.js',
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

      mongodb: [
        'mongodb',
        'mongo db',
        'mongo',
      ],

      docker: [
        'docker',
      ],

      kubernetes: [
        'kubernetes',
        'k8s',
      ],

      sql: [
        'sql',
      ],

      'api rest': [
        'api rest',
        'rest api',
        'api restful',
        'restful api',
      ],

      'machine learning': [
        'machine learning',
        'ml',
      ],

      'power bi': [
        'power bi',
        'powerbi',
      ],
    };

    const possibleValues =
      aliases[canonical] ??
      [canonical];

    if (
      possibleValues.some(
        contains,
      )
    ) {
      return true;
    }

    // ============================================================
    // MATCH DES COMPÉTENCES COMPOSÉES
    // ============================================================

    const ignoredWords =
      new Set([
        'front',
        'end',
        'frontend',

        'back',
        'backend',

        'full',
        'stack',

        'developpeur',
        'developer',
        'developpement',

        'framework',

        'technology',
        'technologie',

        'maitrise',
        'expertise',

        'et',
        'ou',
        'avec',
        'de',
        'des',
        'du',
        'la',
        'le',
        'les',
        'en',
        'pour',
        'sur',
      ]);

    const words =
      searched
        .split(' ')
        .filter(
          (word) =>
            word.length >= 2 &&
            !ignoredWords.has(
              word,
            ),
        );

    if (words.length === 0) {
      return false;
    }

    return words.every(
      (word) => {
        const wordCanonical =
          this.canonicalSkill(
            word,
          );

        const values =
          aliases[
            wordCanonical
          ] ??
          [wordCanonical];

        return values.some(
          contains,
        );
      },
    );
  }

  // ============================================================
  // NORMALISATION DES SKILLS
  // ============================================================

  private canonicalSkill(
    value: string,
  ): string {
    const normalized =
      this.normalize(value);

    const aliases: Record<
      string,
      string
    > = {
      react: 'react',
      reactjs: 'react',
      'react.js': 'react',

      node: 'node',
      nodejs: 'node',
      'node.js': 'node',

      nest: 'nestjs',
      nestjs: 'nestjs',

      nextjs: 'nextjs',
      'next.js': 'nextjs',

      postgres: 'postgresql',
      postgresql: 'postgresql',

      js: 'javascript',
      javascript: 'javascript',

      ts: 'typescript',
      typescript: 'typescript',

      mongo: 'mongodb',
      mongodb: 'mongodb',
      'mongo db': 'mongodb',

      k8s: 'kubernetes',
      kubernetes: 'kubernetes',

      restapi: 'api rest',
      'rest api': 'api rest',
      'api rest': 'api rest',
      restful: 'api rest',
      'restful api': 'api rest',

      ml: 'machine learning',
      'machine learning':
        'machine learning',

      powerbi: 'power bi',
      'power bi': 'power bi',

      gcp: 'google cloud',

      'google cloud':
        'google cloud',

      'google cloud platform':
        'google cloud',

      azure: 'azure',

      'microsoft azure':
        'azure',

      aws: 'aws',

      'amazon web services':
        'aws',
    };

    const compact =
      normalized.replace(
        /\s+/g,
        '',
      );

    return (
      aliases[normalized] ??
      aliases[compact] ??
      normalized
    );
  }

  // ============================================================
  // NETTOYAGE DESCRIPTION
  // ============================================================

  private cleanDescription(
    value: string,
  ): string {
    return value
      // HTML
      .replace(
        /<br\s*\/?>/gi,
        ' ',
      )
      .replace(
        /<\/p>/gi,
        ' ',
      )
      .replace(
        /<[^>]*>/g,
        ' ',
      )

      // Entités HTML
      .replace(
        /&nbsp;/gi,
        ' ',
      )
      .replace(
        /&amp;/gi,
        '&',
      )
      .replace(
        /&quot;/gi,
        '"',
      )
      .replace(
        /&#39;/gi,
        "'",
      )
      .replace(
        /&apos;/gi,
        "'",
      )
      .replace(
        /&lt;/gi,
        '<',
      )
      .replace(
        /&gt;/gi,
        '>',
      )

      // Certains jobboards remplacent
      // parfois une apostrophe par ?
      .replace(
        /([a-zA-ZÀ-ÿ])\?([a-zA-ZÀ-ÿ])/g,
        "$1'$2",
      )

      // Espaces
      .replace(
        /\s+/g,
        ' ',
      )
      .trim()

      // Évite une annonce énorme au LLM
      .slice(
        0,
        6000,
      );
  }

  // ============================================================
  // NORMALISATION TEXTE
  // ============================================================

  private normalize(
    value: string,
  ): string {
    return value
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
  }

  // ============================================================
  // REMOTE
  // ============================================================

  private normalizeRemote(
    value: unknown,
  ): string | null {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (
      typeof value ===
      'boolean'
    ) {
      return value
        ? 'Télétravail possible'
        : 'Pas de télétravail';
    }

    if (
      typeof value ===
      'string'
    ) {
      const cleaned =
        value.trim();

      return cleaned.length > 0
        ? cleaned
        : null;
    }

    return null;
  }

  // ============================================================
  // ANNÉES D'EXPÉRIENCE EXTRAITES DE L'OFFRE
  // ============================================================

  private normalizeMinYearsExperience(
    value: unknown,
  ): number | null {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (
      typeof value === 'number'
    ) {
      if (
        Number.isFinite(value) &&
        value >= 0
      ) {
        return value;
      }

      return null;
    }

    if (
      typeof value === 'string'
    ) {
      const cleaned =
        value
          .replace(',', '.')
          .trim();

      if (!cleaned) {
        return null;
      }

      const parsed =
        Number(cleaned);

      if (
        Number.isFinite(parsed) &&
        parsed >= 0
      ) {
        return parsed;
      }
    }

    return null;
  }

  // ============================================================
  // EXPÉRIENCE CANDIDAT
  // ============================================================

  private candidateExperienceYears(
    experiences: {
      startDate: Date;
      endDate: Date | null;
      current: boolean;
    }[],
  ): number {
    if (
      experiences.length === 0
    ) {
      return 0;
    }

    const now =
      new Date();

    const ranges =
      experiences
        .filter(
          (experience) =>
            experience.startDate,
        )
        .map(
          (experience) => {
            const start =
              new Date(
                experience.startDate,
              ).getTime();

            const end =
              experience.current ||
              !experience.endDate
                ? now.getTime()
                : new Date(
                    experience.endDate,
                  ).getTime();

            return {
              start,
              end:
                Math.max(
                  start,
                  end,
                ),
            };
          },
        )
        .sort(
          (a, b) =>
            a.start -
            b.start,
        );

    if (
      ranges.length === 0
    ) {
      return 0;
    }

    // Fusionner les périodes qui se chevauchent.
    //
    // Exemple :
    // expérience A : 2023 -> 2024
    // freelance    : 2024 -> 2024
    //
    // On évite de compter deux fois les mêmes mois.

    const merged: {
      start: number;
      end: number;
    }[] = [];

    for (
      const range of ranges
    ) {
      const previous =
        merged[
          merged.length - 1
        ];

      if (
        !previous ||
        range.start >
          previous.end
      ) {
        merged.push({
          ...range,
        });
      } else {
        previous.end =
          Math.max(
            previous.end,
            range.end,
          );
      }
    }

    const totalMilliseconds =
      merged.reduce(
        (
          total,
          range,
        ) =>
          total +
          (
            range.end -
            range.start
          ),
        0,
      );

    const years =
      totalMilliseconds /
      (
        1000 *
        60 *
        60 *
        24 *
        365.25
      );

    return years;
  }

  // ============================================================
  // SCORE EXPÉRIENCE
  // ============================================================

  private experienceScore(
    requiredYears: number,
    candidateYears: number,
  ): number {
    if (
      requiredYears <= 0
    ) {
      return 1;
    }

    return Math.min(
      1,
      candidateYears /
        requiredYears,
    );
  }

  // ============================================================
  // SCORE SÉNIORITÉ
  // ============================================================

  private seniorityScore(
    seniority:
      | string
      | null
      | undefined,
    candidateYears: number,
  ): number | null {
    if (!seniority) {
      return null;
    }

    const value =
      this.normalize(
        seniority,
      );

    if (
      value.includes('lead') ||
      value.includes(
        'principal',
      ) ||
      value.includes('staff')
    ) {
      return Math.min(
        1,
        candidateYears / 6,
      );
    }

    if (
      value.includes(
        'senior',
      )
    ) {
      return Math.min(
        1,
        candidateYears / 5,
      );
    }

    if (
      value.includes(
        'confirme',
      ) ||
      value.includes(
        'intermediaire',
      ) ||
      value.includes('mid')
    ) {
      return Math.min(
        1,
        candidateYears / 3,
      );
    }

    if (
      value.includes(
        'junior',
      ) ||
      value.includes(
        'debutant',
      )
    ) {
      // Un profil plus expérimenté
      // reste compatible avec un besoin junior.
      return 1;
    }

    return null;
  }

  // ============================================================
  // SCORE LOCALISATION
  // ============================================================

  private locationScore(
    jobLocation: string | null,
    remote:
      | string
      | null
      | undefined,
    candidateLocation:
      | string
      | null,
  ): number | null {
    if (
      !jobLocation &&
      !remote
    ) {
      return null;
    }

    const job =
      this.normalize(
        jobLocation ?? '',
      );

    const candidate =
      this.normalize(
        candidateLocation ?? '',
      );

    const remoteValue =
      this.normalize(
        remote ?? '',
      );

    // Télétravail / hybride
    if (
      remoteValue.includes(
        'remote',
      ) ||
      remoteValue.includes(
        'teletravail',
      ) ||
      remoteValue.includes(
        'hybride',
      )
    ) {
      return 1;
    }

    // Même localisation exacte
    if (
      job &&
      candidate &&
      (
        candidate.includes(
          job,
        ) ||
        job.includes(
          candidate,
        )
      )
    ) {
      return 1;
    }

    // Île-de-France
    const ileDeFranceTerms = [
      'ile de france',
      'paris',
      'hauts de seine',

      '75',
      '77',
      '78',
      '91',
      '92',
      '93',
      '94',
      '95',
    ];

    const candidateInIdf =
      ileDeFranceTerms.some(
        (term) =>
          candidate.includes(
            term,
          ),
      );

    const jobInIdf =
      ileDeFranceTerms.some(
        (term) =>
          job.includes(
            term,
          ),
      );

    if (
      candidateInIdf &&
      jobInIdf
    ) {
      return 1;
    }

    return 0;
  }
}