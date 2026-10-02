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
  remote?: string | null;
  salarySummary?: string | null;

  summary?: string | null;
};

@Injectable()
export class JobAnalyzerService {
  constructor(private readonly prisma: PrismaService) { }

  async analyze(jobId: string) {
    // ============================================================
    // 1. Récupérer l'offre
    // ============================================================

    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new Error('Offre introuvable');
    }

    // ============================================================
    // 2. Récupérer le profil candidat
    // ============================================================

    const profile = await this.prisma.candidateProfile.findFirst({
      include: {
        experiences: true,
        educations: true,
        skills: true,
        projects: true,
      },
    });

    if (!profile) {
      throw new Error('Profil candidat introuvable');
    }

    // ============================================================
    // 3. Construire la source de vérité candidat
    // ============================================================

    const candidateText = [
      profile.headline,
      profile.summary,

      ...profile.skills.map((skill) => skill.name),

      ...profile.experiences.flatMap((experience) => [
        experience.title,
        experience.description,
        ...experience.bullets,
      ]),

      ...profile.projects.flatMap((project) => [
        project.name,
        project.description,
        ...project.technologies,
      ]),

      ...profile.educations.flatMap((education) => [
        education.degree,
        education.field,
        education.description,
      ]),
    ]
      .filter(Boolean)
      .join('\n');

    // ============================================================
    // 4. Demander à Ollama d'analyser UNIQUEMENT l'offre
    // ============================================================

    const extraction = await this.extractJobRequirements(job);

    const requiredSkills = this.cleanArray(
      extraction.requiredSkills,
    );

    const optionalSkills = this.cleanArray(
      extraction.optionalSkills,
    );

    const technologies = this.cleanArray(
      extraction.technologies,
    );
    const remote =
      this.normalizeRemote(
        extraction.remote,
      );

    // ============================================================
    // 5. Matching déterministe
    // Le LLM ne décide PAS des compétences candidat.
    // ============================================================

    const matchedRequiredSkills = requiredSkills.filter(
      (skill) =>
        this.candidateHasSkill(
          candidateText,
          skill,
        ),
    );
    const requiredSkillScore =
      requiredSkills.length > 0
        ? requiredSkills.reduce(
          (total, skill) => {
            if (
              !this.candidateHasSkill(
                candidateText,
                skill,
              )
            ) {
              return total;
            }

            const level =
              this.getSkillLevel(
                profile.skills,
                skill,
              );

            return (
              total +
              this.levelFactor(level)
            );
          },
          0,
        ) / requiredSkills.length
        : null;
    const technologySkillScore =
      technologies.length > 0
        ? technologies.reduce(
          (total, tech) => {
            if (
              !this.candidateHasSkill(
                candidateText,
                tech,
              )
            ) {
              return total;
            }

            const level =
              this.getSkillLevel(
                profile.skills,
                tech,
              );

            return (
              total +
              this.levelFactor(level)
            );
          },
          0,
        ) / technologies.length
        : null;

    const matchedOptionalSkills = optionalSkills.filter(
      (skill) =>
        this.candidateHasSkill(
          candidateText,
          skill,
        ),
    );
    const matchedTechnologies = technologies.filter(
      (technology) =>
        this.candidateHasSkill(
          candidateText,
          technology,
        ),
    );

    const matchedSkills = Array.from(
      new Set([
        ...matchedRequiredSkills,
        ...matchedOptionalSkills,
        ...matchedTechnologies,
      ]),
    );

    const missingSkills = requiredSkills.filter(
      (skill) =>
        !this.candidateHasSkill(
          candidateText,
          skill,
        ),
    );

    // ============================================================
    // 6. SCORE V2
    // ============================================================

    // Compétences obligatoires : 60 %
    // Technologies : 20 %
    // Compétences optionnelles : 10 %
    //
    // Plus tard :
    // Séniorité : 5 %
    // Localisation / contrat : 5 %

    const requiredRatio =
      requiredSkillScore;

    const technologyRatio =
      technologySkillScore;

    const optionalRatio =
      optionalSkills.length > 0
        ? matchedOptionalSkills.length /
        optionalSkills.length
        : null;

    const seniorityRatio =
      this.seniorityScore(
        extraction.seniority,
      );
    const locationRatio =
      this.locationScore(
        job.location,
        extraction.remote,
        profile.location,
      );

    const scoreParts = [
      {
        ratio: requiredRatio,
        weight: 55,
      },
      {
        ratio: technologyRatio,
        weight: 20,
      },
      {
        ratio: optionalRatio,
        weight: 10,
      },
      {
        ratio: seniorityRatio,
        weight: 10,
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
    console.log(
      'Required ratio:',
      requiredRatio,
    );

    console.log(
      'Technology ratio:',
      technologyRatio,
    );

    console.log(
      'Seniority ratio:',
      seniorityRatio,
    );

    console.log(
      'Location ratio:',
      locationRatio,
    );

    const totalWeight = scoreParts.reduce(
      (total, part) =>
        total + part.weight,
      0,
    );

    const weightedScore = scoreParts.reduce(
      (total, part) =>
        total +
        part.ratio * part.weight,
      0,
    );

    const score =
      totalWeight > 0
        ? Math.round(
          (weightedScore / totalWeight) *
          100,
        )
        : 0;
    console.log('=== SCORE V2 ===');
    console.log(
      'Required:',
      matchedRequiredSkills.length,
      '/',
      requiredSkills.length,
    );

    console.log(
      'Technologies:',
      matchedTechnologies.length,
      '/',
      technologies.length,
    );

    console.log(
      'Optional:',
      matchedOptionalSkills.length,
      '/',
      optionalSkills.length,
    );

    console.log('Score:', score);
    console.log('================');
    // ============================================================
    // 7. Sauvegarder JobAnalysis
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
            extraction.seniority ?? null,

          remote,

          salarySummary:
            extraction.salarySummary ?? null,

          matchedSkills,
          missingSkills,

          score,

          summary:
            extraction.summary ?? null,
        },

        create: {
          jobId: job.id,

          requiredSkills,
          optionalSkills,
          technologies,

          seniority:
            extraction.seniority ?? null,

          remote,

          salarySummary:
            extraction.salarySummary ?? null,

          matchedSkills,
          missingSkills,

          score,

          summary:
            extraction.summary ?? null,
        },
      });

    return {
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        source: job.source,
      },

      analysis,
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

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(
          `[OLLAMA] Tentative ${attempt}/2`,
        );

        const response = await fetch(
          `${baseUrl}/api/chat`,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            // 3 minutes maximum
            signal: AbortSignal.timeout(180000),

            body: JSON.stringify({
              model,

              stream: false,

              format: 'json',

              // IMPORTANT pour Qwen3 :
              // pas besoin de raisonnement long
              think: false,

              options: {
                temperature: 0,
              },

              messages: [
                {
                  role: 'system',
                  content:
                    "Tu es un analyseur d'offres d'emploi. Tu extrais uniquement les informations réellement présentes dans l'annonce. Tu ne dois jamais inventer.",
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

        // IMPORTANT :
        // on vérifie le JSON AVANT de considérer
        // la tentative comme réussie.
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

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new Error(
      'Impossible de contacter Ollama.',
    );
  }


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
      process.env.OLLAMA_BASE_URL ??
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

- requiredSkills doit contenir toutes les compétences, technologies, frameworks, langages, bases de données, outils ou plateformes explicitement nécessaires pour réaliser les missions.

- Une technologie utilisée directement dans une mission doit être considérée comme requise même si l'annonce ne dit pas explicitement "compétence requise".

Exemples :

"Vous développerez les interfaces avec React"
=> React doit être dans requiredSkills.

"Le backend repose sur Node.js"
=> Node.js doit être dans requiredSkills.

"Vous travaillerez avec PostgreSQL"
=> PostgreSQL doit être dans requiredSkills.

"Déploiement sur Azure"
=> Azure doit être dans requiredSkills si Azure fait partie des missions du poste.

- optionalSkills doit contenir uniquement les compétences indiquées comme bonus, souhaitées, appréciées ou facultatives.

Exemple :

"Une connaissance de Docker serait un plus"
=> Docker doit être dans optionalSkills.

- technologies doit contenir tous les frameworks, langages, services cloud, bases de données, outils et plateformes réellement liés au poste.

- Une technologie centrale apparaissant dans le titre ou dans les missions doit être présente à la fois dans requiredSkills et technologies.

- Ne considère pas comme requise une technologie simplement mentionnée dans la présentation générale de l'entreprise si elle n'est pas liée aux missions ou au profil recherché.

- seniority = junior, confirmé, senior, lead, etc. uniquement si identifiable.

- remote doit toujours être une chaîne de caractères ou null.
- Ne retourne jamais true ou false pour remote.
- Exemples : "Hybride", "Télétravail possible", "100% remote", "2 jours par semaine", null.

- salarySummary = salaire uniquement s'il apparaît dans l'offre.

- summary = résumé très court de l'offre obligatoirement en français.

- Utilise une orthographe française correcte.

- Retourne uniquement du JSON valide.

- N'ajoute aucun texte avant ou après le JSON.

FORMAT :

{
  "requiredSkills": [],
  "optionalSkills": [],
  "technologies": [],
  "seniority": null,
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

    const data = await this.callOllama(
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
              typeof value === 'string',
          )
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );
  }

  private candidateHasSkill(
    candidateText: string,
    skill: string,
  ): boolean {
    const candidate =
      this.normalize(candidateText);

    const searched =
      this.normalize(skill);

    if (!searched) {
      return false;
    }

    // ============================================================
    // MATCH EXACT / MOT COMPLET
    // Évite les correspondances partielles dangereuses.
    // ============================================================

    const contains = (
      value: string,
    ): boolean => {
      const normalized =
        this.normalize(value);

      if (!normalized) {
        return false;
      }

      if (candidate === normalized) {
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
    // CLOUD PROVIDERS : MATCH STRICT
    // Azure ≠ Google Cloud ≠ AWS
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
      canonical ===
      'azure'
    ) {
      return [
        'azure',
        'microsoft azure',
      ].some(contains);
    }

    if (
      canonical ===
      'aws'
    ) {
      return [
        'aws',
        'amazon web services',
      ].some(contains);
    }

    // ============================================================
    // ALIASES TECHNIQUES
    // ============================================================

    const aliases:
      Record<string, string[]> = {
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
    };

    // ============================================================
    // MATCH DE LA COMPÉTENCE COMPLÈTE
    // ============================================================

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
    // Ex : "Développement Full Stack Python"
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
  private canonicalSkill(value: string): string {
    const normalized = this.normalize(value);

    const aliases: Record<string, string> = {
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

      gcp:
        'google cloud',

      'google cloud':
        'google cloud',

      'google cloud platform':
        'google cloud',

      azure:
        'azure',

      'microsoft azure':
        'azure',

      aws:
        'aws',

      'amazon web services':
        'aws',
    };

    const compact = normalized.replace(/\s+/g, '');

    return (
      aliases[normalized] ??
      aliases[compact] ??
      normalized
    );
  }
  private cleanDescription(value: string): string {
    return value
      // HTML
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')

      // Entités HTML
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')

      // Certains jobboards remplacent l'apostrophe par ?
      .replace(
        /([a-zA-ZÀ-ÿ])\?([a-zA-ZÀ-ÿ])/g,
        "$1'$2",
      )

      // Espaces
      .replace(/\s+/g, ' ')
      .trim()

      // Évite d'envoyer une annonce énorme au LLM
      .slice(0, 6000);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, ' ')
      .trim();
  }
  private normalizeRemote(
    value: unknown,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'boolean') {
      return value
        ? 'Télétravail possible'
        : 'Pas de télétravail';
    }

    if (typeof value === 'string') {
      const cleaned = value.trim();

      return cleaned.length > 0
        ? cleaned
        : null;
    }

    return null;
  }
  private getSkillLevel(
    skills: {
      name: string;
      level: number | null;
    }[],
    searchedSkill: string,
  ): number | null {
    for (const skill of skills) {
      const matches =
        this.candidateHasSkill(
          skill.name,
          searchedSkill,
        ) ||
        this.candidateHasSkill(
          searchedSkill,
          skill.name,
        );

      if (matches) {
        return skill.level ?? null;
      }
    }

    return null;
  }
  private levelFactor(
    level: number | null,
  ): number {
    switch (level) {
      case 5:
        return 1;

      case 4:
        return 0.9;

      case 3:
        return 0.75;

      case 2:
        return 0.5;

      case 1:
        return 0.25;

      default:
        return 0.7;
    }
  }
  private seniorityScore(
    seniority: string | null | undefined,
  ): number | null {
    if (!seniority) {
      return null;
    }

    const value = this.normalize(seniority);

    // Ton profil : environ 4+ ans d'expérience
    if (
      value.includes('senior') ||
      value.includes('lead')
    ) {
      return 0.75;
    }

    if (
      value.includes('confirme') ||
      value.includes('intermediaire') ||
      value.includes('mid')
    ) {
      return 1;
    }

    if (
      value.includes('junior') ||
      value.includes('debutant')
    ) {
      return 1;
    }

    return 0.9;
  }
  private locationScore(
    jobLocation: string | null,
    remote: string | null | undefined,
    candidateLocation: string | null,
  ): number | null {
    if (!jobLocation && !remote) {
      return null;
    }

    const job = this.normalize(jobLocation ?? '');
    const candidate = this.normalize(candidateLocation ?? '');
    const remoteValue = this.normalize(remote ?? '');

    // Télétravail / remote
    if (
      remoteValue.includes('remote') ||
      remoteValue.includes('teletravail') ||
      remoteValue.includes('hybride')
    ) {
      return 1;
    }

    // Même localisation exacte
    if (
      job &&
      candidate &&
      (
        candidate.includes(job) ||
        job.includes(candidate)
      )
    ) {
      return 1;
    }

    // Île-de-France
    const ileDeFranceTerms = [
      'ile de france',
      'paris',
      'hauts de seine',
      '92',
      '75',
      '93',
      '94',
      '95',
      '78',
      '91',
      '77',
    ];

    const candidateInIdf =
      ileDeFranceTerms.some((term) =>
        candidate.includes(term),
      );

    const jobInIdf =
      ileDeFranceTerms.some((term) =>
        job.includes(term),
      );

    if (candidateInIdf && jobInIdf) {
      return 1;
    }

    return 0;
  }
}