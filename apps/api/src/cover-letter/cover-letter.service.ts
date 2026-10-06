import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CoverLetterService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // GENERATE
  // ============================================================

  async generate(
    jobId: string,
    resumeId: string,
  ) {
    // ============================================================
    // 1. RÉCUPÉRER L'OFFRE
    // ============================================================

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

    // ============================================================
    // 2. RÉCUPÉRER LE CV PERSONNALISÉ
    // ============================================================

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

    // ============================================================
    // 3. VÉRIFIER QUE LE CV CORRESPOND À L'OFFRE
    // ============================================================

    if (
      resume.jobId &&
      resume.jobId !== job.id
    ) {
      throw new BadRequestException(
        "Ce CV personnalisé ne correspond pas à cette offre.",
      );
    }

    // ============================================================
    // 4. DONNÉES DE MATCHING
    // ============================================================

    const matchedSkills =
      job.analysis?.matchedSkills ?? [];

    const missingSkills =
      job.analysis?.missingSkills ?? [];

    const score =
      job.analysis?.score ?? 0;

    // ============================================================
    // 5. PROMPT
    //
    // IMPORTANT :
    // On NE DONNE PLUS la description complète de l'offre.
    //
    // Pourquoi ?
    // Parce que Qwen récupérait C++, Linux, Gtest,
    // ISO27001, etc. dans l'offre et les transformait
    // ensuite en compétences candidat.
    // ============================================================

    const prompt = `
Tu rédiges une lettre de motivation professionnelle en français.

============================================================
RÈGLE ABSOLUE
============================================================

Le CV personnalisé fourni plus bas est la SEULE SOURCE DE VÉRITÉ
concernant le candidat.

Tu ne dois jamais inventer :

- une compétence
- une technologie
- un langage
- un framework
- une certification
- une norme
- une méthodologie
- une expérience
- une responsabilité
- une durée d'expérience
- une compétence comportementale
- un niveau de langue

Le titre du poste décrit uniquement le poste recherché.

Tu ne dois JAMAIS déduire une compétence candidat depuis le titre
du poste.

============================================================
POSTE CIBLÉ
============================================================

Titre :
${job.title}

Entreprise :
${job.company ?? 'Non renseignée'}

Lieu :
${job.location ?? 'Non renseigné'}

============================================================
SCORE DE COMPATIBILITÉ
============================================================

${score} %

${
  score < 50
    ? `
ATTENTION :

Le score de compatibilité est faible.

Tu ne dois jamais écrire :

- "mon profil correspond parfaitement"
- "mon profil correspond à vos attentes"
- "mes compétences correspondent parfaitement"
- "mes compétences sont parfaitement alignées"
- "je possède toutes les compétences recherchées"
- "je maîtrise les technologies demandées"

Tu ne dois pas qualifier le score de :

- bon
- élevé
- important
- modéré

Ne mentionne pas directement le pourcentage dans la lettre.

Tu peux éventuellement utiliser une formulation neutre :

"Certains aspects de mon parcours peuvent être pertinents pour ce poste."
`
    : ''
}

============================================================
COMPÉTENCES CONFIRMÉES
============================================================

Les compétences suivantes ont été détectées comme compatibles :

${JSON.stringify(
  matchedSkills,
  null,
  2,
)}

ATTENTION :

Même une compétence de cette liste ne doit être utilisée que
si elle est réellement justifiable par le CV personnalisé.

============================================================
CV PERSONNALISÉ
SOURCE DE VÉRITÉ UNIQUE
============================================================

${JSON.stringify(
  resume.content,
  null,
  2,
)}

============================================================
RÈGLES DE RÉDACTION
============================================================

La lettre doit :

- être écrite en français
- être professionnelle
- être naturelle
- être directe
- faire maximum 250 mots
- commencer exactement par :

Madame, Monsieur,

- se terminer par une formule de politesse professionnelle
- utiliser uniquement des faits présents dans le CV

Pas de markdown.

Pas de :

**texte en gras**

Pas de titre :

"Lettre de motivation"

Pas de sections comme :

"Compétences techniques"
"Formation"
"Expérience"
"Projet et vision"

Pas de listes à puces.

La lettre doit ressembler à une vraie lettre,
pas à une copie du CV.

============================================================
FORMULATIONS
============================================================

Privilégie :

"J'ai travaillé avec Python."

"J'ai utilisé Azure DevOps dans le cadre de mes projets."

"Mon parcours comprend du développement backend avec NestJS."

"J'ai travaillé sur des pipelines CI/CD."

Évite :

"Je maîtrise..."

"Je suis expert..."

"Mon expertise..."

"Solide maîtrise..."

"Solide expérience..."

"Expertise approfondie..."

============================================================
TECHNOLOGIES
============================================================

N'invente jamais une technologie.

Exemple :

Si le CV contient Azure :

tu peux parler d'Azure.

Tu ne peux PAS transformer Azure en :

- AWS
- Google Cloud
- GCP

Si le CV ne contient pas C++ :

tu ne dois jamais parler de C++.

Si le CV ne contient pas Linux :

tu ne dois jamais parler de Linux.

Si le CV ne contient pas une norme de cybersécurité :

tu ne dois jamais prétendre que le candidat connaît cette norme.

============================================================
CYBERSÉCURITÉ
============================================================

Le fait que le titre du poste contienne le mot
"Cybersécurité" ne signifie PAS que le candidat possède
une expérience en cybersécurité.

Ne présente jamais le candidat comme :

- expert cybersécurité
- développeur cybersécurité expérimenté
- spécialiste sécurité
- expert sécurité OT

sauf si ces faits apparaissent explicitement dans le CV.

============================================================
COORDONNÉES
============================================================

Les coordonnées réelles sont présentes dans le CV.

Tu peux les utiliser pour signer la lettre.

N'utilise JAMAIS :

[Votre Nom]
[Adresse]
[Email]
[Téléphone]
[LinkedIn]
[GitHub]
[Date]

ou tout autre placeholder.

============================================================
VÉRIFICATION FINALE
============================================================

Avant de retourner la lettre, vérifie chaque phrase.

Pour chaque compétence technique mentionnée comme appartenant
au candidat, pose-toi la question :

"Cette information apparaît-elle réellement dans le CV fourni ?"

Si NON :

supprime cette phrase.

Retourne uniquement le texte final de la lettre.
`;

    // ============================================================
    // 6. PREMIÈRE GÉNÉRATION
    // ============================================================

    let content =
      await this.callOllama(
        prompt,
      );

    // ============================================================
    // 7. NETTOYAGE
    // ============================================================

    content =
      this.cleanGeneratedLetter(
        content,
      );

    // ============================================================
    // 8. VÉRIFICATION ANTI-HALLUCINATION
    // ============================================================

    let forbiddenMentions =
     this.findForbiddenMentions(
  content,
  missingSkills,
  resume.content,
);

    // ============================================================
    // 9. SI LE LLM A ENCORE HALLUCINÉ :
    // ON LUI DEMANDE DE CORRIGER SA PROPRE LETTRE
    // ============================================================

    if (
      forbiddenMentions.length > 0
    ) {
      console.warn(
        '[COVER LETTER] Hallucinations détectées :',
        forbiddenMentions,
      );

      content =
        await this.repairLetter(
          content,
          resume.content,
          forbiddenMentions,
        );

      content =
        this.cleanGeneratedLetter(
          content,
        );

      forbiddenMentions =
        this.findForbiddenMentions(
  content,
  missingSkills,
  resume.content,
);
    }

    // ============================================================
    // 10. SI L'HALLUCINATION RESTE :
    // ON REFUSE DE SAUVEGARDER
    // ============================================================

    if (
      forbiddenMentions.length > 0
    ) {
      throw new BadRequestException(
        `Lettre refusée : compétences non justifiées détectées : ${forbiddenMentions.join(
          ', ',
        )}`,
      );
    }

    // ============================================================
    // 11. SAUVEGARDE
    // ============================================================

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

  // ============================================================
  // GET ONE
  // ============================================================

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

  // ============================================================
  // NETTOYAGE LETTRE
  // ============================================================

  private cleanGeneratedLetter(
    content: string,
  ): string {
    return content

      // Retirer titre Markdown
      .replace(
        /^\s*#{1,6}\s*Lettre de motivation\s*/i,
        '',
      )

      .replace(
        /^\s*\*{0,2}Lettre de motivation\*{0,2}\s*/i,
        '',
      )

      // Retirer Markdown bold
      .replace(
        /\*\*/g,
        '',
      )

      // Formulations trop fortes
      .replace(
        /\bsolide maîtrise\b/gi,
        'expérience avec',
      )

      .replace(
        /\bmaîtrise approfondie\b/gi,
        'expérience avec',
      )

      .replace(
        /\bsolide expérience\b/gi,
        'expérience',
      )

      .replace(
        /\bmon expertise\b/gi,
        'mes compétences',
      )

      .replace(
        /\bune expertise\b/gi,
        'une expérience',
      )

      // Espaces
      .replace(
        /[ \t]+/g,
        ' ',
      )

      .replace(
        / +\n/g,
        '\n',
      )

      .replace(
        /\n{3,}/g,
        '\n\n',
      )

      .trim();
  }

  // ============================================================
  // DÉTECTION DES COMPÉTENCES INTERDITES
  // ============================================================

  private findForbiddenMentions(
  content: string,
  missingSkills: string[],
  resumeContent: unknown,
): string[] {
  const normalizedContent =
    this.normalizeForSearch(
      content,
    );

  const normalizedResume =
    this.normalizeForSearch(
      JSON.stringify(
        resumeContent ?? {},
      ),
    );

  const forbiddenTerms =
    this.extractForbiddenTerms(
      missingSkills,
    );

  return Array.from(
    new Set(
      forbiddenTerms.filter(
        (term) => {
          const normalizedTerm =
            this.normalizeForSearch(
              term,
            );

          if (!normalizedTerm) {
            return false;
          }

          // IMPORTANT :
          // si le terme existe réellement
          // dans le CV, il n'est PAS interdit.
          if (
            normalizedResume.includes(
              normalizedTerm,
            )
          ) {
            return false;
          }

          // Il n'est interdit que s'il apparaît
          // dans la lettre ET pas dans le CV.
          return normalizedContent.includes(
            normalizedTerm,
          );
        },
      ),
    ),
  );
}

  // ============================================================
  // EXTRAIRE LES TECHNOLOGIES IMPORTANTES
  // DEPUIS missingSkills
  // ============================================================

  private extractForbiddenTerms(
    missingSkills: string[],
  ): string[] {
    const terms =
      new Set<string>();

    for (
      const skill of missingSkills
    ) {
      if (!skill) {
        continue;
      }

   

      // ========================================================
      // EXTRACTION DES TECHNOLOGIES / NORMES
      // ========================================================

      const technicalPatterns = [
        /\bC\+\+\b/gi,
        /\bC#\b/gi,

        /\bLinux\b/gi,

        /\bGtest\b/gi,

        /\bUML\b/gi,

        /\bAngular(?:JS)?\b/gi,

        /\bReact(?:JS)?\b/gi,

        /\bVue(?:\.js|JS)?\b/gi,

        /\bAWS\b/gi,

        /\bGCP\b/gi,

        /\bGoogle Cloud(?: Platform)?\b/gi,

        /\bAzure\b/gi,

        /\bKubernetes\b/gi,

        /\bDocker\b/gi,

        /\bISO[- ]?\d+\b/gi,

        /\bIEC[- ]?\d+\b/gi,

        /\bNERC[- ]?CIP\b/gi,
      ];

      for (
        const pattern of
          technicalPatterns
      ) {
        const matches =
          skill.match(
            pattern,
          );

        if (!matches) {
          continue;
        }

        for (
          const match of matches
        ) {
          terms.add(match);
        }
      }
    }

    return Array.from(
      terms,
    );
  }

  // ============================================================
  // NORMALISATION POUR COMPARAISON
  // ============================================================

  private normalizeForSearch(
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
        /\s+/g,
        ' ',
      )

      .trim();
  }

  // ============================================================
  // RÉPARATION AUTOMATIQUE
  // ============================================================

  private async repairLetter(
    content: string,
    resumeContent: unknown,
    forbiddenMentions: string[],
  ): Promise<string> {
    const prompt = `
Tu dois CORRIGER une lettre de motivation existante.

La lettre contient des affirmations techniques qui ne sont
pas justifiées par le CV.

============================================================
SOURCE DE VÉRITÉ
============================================================

Le CV suivant est la seule source autorisée :

${JSON.stringify(
  resumeContent,
  null,
  2,
)}

============================================================
ÉLÉMENTS INTERDITS
============================================================

Les éléments suivants ne doivent absolument PAS être présentés
comme appartenant au candidat :

${JSON.stringify(
  forbiddenMentions,
  null,
  2,
)}

Supprime complètement toute phrase affirmant que le candidat
possède, maîtrise ou a utilisé ces éléments.

Ne remplace pas ces éléments par d'autres compétences inventées.

============================================================
LETTRE À CORRIGER
============================================================

${content}

============================================================
RÈGLES
============================================================

- Conserve une lettre naturelle.
- Maximum 250 mots.
- Pas de markdown.
- Pas de titre.
- Pas de listes.
- N'invente rien.
- N'ajoute aucune nouvelle technologie.
- Utilise uniquement le CV.
- Commence par "Madame, Monsieur,".
- Retourne uniquement la lettre corrigée.
`;

    return this.callOllama(
      prompt,
    );
  }

  // ============================================================
  // OLLAMA
  // ============================================================

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
      const baseUrl =
        process.env
          .OLLAMA_BASE_URL ??
        'http://localhost:11434';

      const model =
        process.env
          .OLLAMA_MODEL ??
        'qwen3:8b';

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
              controller.signal,

            body:
              JSON.stringify({
                model,

                stream:
                  false,

                think:
                  false,

                messages: [
                  {
                    role:
                      'system',

                    content: `
Tu rédiges des lettres de motivation strictement factuelles.

Règle fondamentale :

Le CV décrit le candidat.

Le poste décrit uniquement le poste.

Tu ne dois jamais transformer une exigence du poste en compétence du candidat.

Si une information n'existe pas dans le CV,
considère qu'elle n'existe pas.

Il est préférable d'omettre une information plutôt que de l'inventer.
`,
                  },

                  {
                    role:
                      'user',

                    content:
                      prompt,
                  },
                ],

                options: {
                  temperature:
                    0,
                },
              }),
          },
        );

      if (
        !response.ok
      ) {
        const errorText =
          await response.text();

        throw new Error(
          `Ollama ${response.status} : ${errorText}`,
        );
      }

      const data =
        (await response.json()) as {
          message?: {
            content?: string;
          };
        };

      const content =
        data.message
          ?.content
          ?.trim();

      if (!content) {
        throw new Error(
          'Lettre vide retournée par Ollama',
        );
      }

      return content;
    } finally {
      clearTimeout(
        timeout,
      );
    }
  }
}