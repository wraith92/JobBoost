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

const scoreParts = [
  {
    ratio: requiredRatio,
    weight: 60,
  },
  {
    ratio: technologyRatio,
    weight: 20,
  },
  {
    ratio: optionalRatio,
    weight: 10,
  },
].filter(
  (
    part,
  ): part is {
    ratio: number;
    weight: number;
  } => part.ratio !== null,
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

          remote:
            extraction.remote ?? null,

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

          remote:
            extraction.remote ?? null,

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
    const cleanDescription = this.cleanDescription(
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

- seniority = junior, confirmé, senior, lead, etc. uniquement si identifiable dans l'offre.

- remote = information sur le télétravail uniquement si elle est identifiable dans l'offre.

- salarySummary = salaire ou fourchette salariale uniquement si elle apparaît dans l'offre.

- summary = résumé très court de l'offre, rédigé obligatoirement en français.

- Corrige uniquement les problèmes évidents d'encodage ou de caractères du texte.

- Utilise une orthographe française correcte.

- Retourne uniquement du JSON valide.

- N'invente aucune information absente de l'offre.

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

    const response = await fetch(
      `${baseUrl}/api/chat`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          model,

          stream: false,

          format: 'json',

          options: {
            temperature: 0,
          },

          messages: [
            {
              role: 'system',

              content:
                'Tu es un analyseur d’offres d’emploi. Tu extrais uniquement les informations réellement présentes dans l’annonce. Tu ne dois jamais inventer.',
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
      const error =
        await response.text();

      throw new Error(
        `Erreur Ollama : ${response.status} ${error}`,
      );
    }

    const data =
      (await response.json()) as OllamaResponse;

    const content =
      data.message?.content;

    if (!content) {
      throw new Error(
        'Ollama n’a retourné aucune analyse',
      );
    }

    try {
      return JSON.parse(content) as JobExtraction;
    } catch {
      console.error(
        '[OLLAMA] JSON invalide :',
        content,
      );

      return {
        requiredSkills: [],
        optionalSkills: [],
        technologies: [],
        seniority: null,
        remote: null,
        salarySummary: null,
        summary:
          "L'offre n'a pas pu être analysée complètement.",
      };
    }
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
    const candidate = this.normalize(candidateText);
    const searched = this.normalize(skill);

    if (!searched) {
      return false;
    }

    // Ex: React === react === REACT
    if (candidate.includes(searched)) {
      return true;
    }

    const aliases: Record<string, string[]> = {
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

      'google cloud': [
        'google cloud',
        'google cloud platform',
        'gcp',
      ],

      azure: [
        'azure',
        'microsoft azure',
      ],
    };

    // Cas : "Front-End React"
    const ignoredWords = new Set([
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

    const words = searched
      .split(' ')
      .filter(
        (word) =>
          word.length >= 2 &&
          !ignoredWords.has(word),
      );

    for (const word of words) {
      const canonical = this.canonicalSkill(word);

      const possibleValues =
        aliases[canonical] ?? [canonical];

      const found = possibleValues.some(
        (alias) =>
          candidate.includes(
            this.normalize(alias),
          ),
      );

      if (!found) {
        return false;
      }
    }

    return words.length > 0;
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

      gcp: 'google cloud',
      'google cloud': 'google cloud',
      'google cloud platform': 'google cloud',

      azure: 'azure',
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
      .slice(0, 12000);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, ' ')
      .trim();
  }
}