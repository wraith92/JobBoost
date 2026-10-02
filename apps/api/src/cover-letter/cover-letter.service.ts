import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CoverLetterService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    jobId: string,
    resumeId: string,
  ) {
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
      throw new NotFoundException(
        'Offre introuvable',
      );
    }

    const resume =
      await this.prisma.resume.findUnique({
        where: {
          id: resumeId,
        },
      });

    if (!resume) {
      throw new NotFoundException(
        'CV introuvable',
      );
    }

    const prompt = `
Tu rédiges une lettre de motivation professionnelle en français.
Avant d'écrire la lettre, compare mentalement les technologies demandées dans l'offre avec celles présentes dans le CV.

Technologie demandée + présente dans le CV :
tu peux la mettre en avant.

Technologie demandée + absente du CV :
tu ne dois jamais prétendre que le candidat la connaît ou l'a utilisée.
RÈGLES STRICTES :

- Utilise uniquement les informations présentes dans le CV fourni.
- N'invente jamais une compétence.
- N'invente jamais une expérience.
- N'invente jamais une entreprise.
- N'invente jamais une durée d'expérience.
- Ne prétends jamais maîtriser une technologie absente du CV.
- Si une technologie demandée est absente du profil, ne dis pas que le candidat la maîtrise.
- Ne sois pas excessivement flatteur.
- Pas de phrases génériques du type "votre entreprise leader dans son domaine" si aucune information ne le prouve.
- Maximum 300 mots.
- Style professionnel, naturel et direct.
- Pas de markdown.
- Pas de titre "Lettre de motivation".
- Commence par "Madame, Monsieur,".
- Termine par une formule de politesse professionnelle.

RÈGLES ANTI-HALLUCINATION STRICTES :

- Une technologie présente uniquement dans l'offre mais absente du CV ne doit JAMAIS être présentée comme une compétence du candidat.
- Distingue toujours les technologies de l'offre des technologies réellement présentes dans le profil.
- Ne transforme jamais une expérience Azure en expérience Google Cloud ou AWS.
- Si Angular, Google Cloud ou toute autre technologie demandée est absente du CV, indique au maximum qu'elle n'est pas renseignée dans l'expérience du candidat. Ne prétends jamais qu'il l'a utilisée.
- Préfère "expérience avec Python" à "maîtrise de Python", sauf si le niveau de compétence du profil justifie explicitement cette formulation.
- N'utilise pas "expert", "expertise", "solide expérience", "maîtrise", "passionné", "capacité à apprendre rapidement" sauf si ces éléments sont explicitement présents dans les données du profil.
- Ne dis jamais "mon profil correspond parfaitement" ou équivalent.
- Toute affirmation technique doit être directement justifiable par le CV fourni.
- Corrige les espaces et la ponctuation avant de retourner le texte.

OFFRE :

Titre :
${job.title}

Entreprise :
${job.company ?? 'Non renseignée'}

Description :
${job.description ?? ''}

Analyse :

${JSON.stringify(
  job.analysis,
  null,
  2,
)}

CV PERSONNALISÉ :

${JSON.stringify(
  resume.content,
  null,
  2,
)}

Rédige maintenant la lettre.
`;

    const content =
      await this.callOllama(
        prompt,
      );

    return this.prisma.coverLetter.create({
      data: {
        jobId:
          job.id,

        resumeId:
          resume.id,

        title:
          `Candidature — ${job.title}`,

        content,

        status:
          'DRAFT',
      },
    });
  }

  async findOne(
    id: string,
  ) {
    const letter =
      await this.prisma.coverLetter.findUnique({
        where: {
          id,
        },

        include: {
          job: true,
          resume: true,
        },
      });

    if (!letter) {
      throw new NotFoundException(
        'Lettre introuvable',
      );
    }

    return letter;
  }

  private async callOllama(
    prompt: string,
  ): Promise<string> {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        180000,
      );

    try {
      const response =
        await fetch(
          'http://localhost:11434/api/chat',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            signal:
              controller.signal,

            body:
              JSON.stringify({
                model:
                  'qwen3:8b',

                stream:
                  false,

                think:
                  false,

                messages: [
                  {
                    role: 'user',
                    content:
                      prompt,
                  },
                ],

                options: {
                  temperature:
                    0.2,
                },
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          `Ollama ${response.status}`,
        );
      }

      const data =
        (await response.json()) as {
          message?: {
            content?: string;
          };
        };

      const content =
        data.message?.content?.trim();

      if (!content) {
        throw new Error(
          'Lettre vide retournée par Ollama',
        );
      }

      return content;
    } finally {
      clearTimeout(timeout);
    }
  }
}