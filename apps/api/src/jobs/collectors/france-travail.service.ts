import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class FranceTravailService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAccessToken(): Promise<string> {
    const clientId = process.env.FT_CLIENT_ID;
    const clientSecret = process.env.FT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        'FT_CLIENT_ID ou FT_CLIENT_SECRET manquant dans .env',
      );
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'api_offresdemploiv2 o2dsoffre',
    });

    const response = await fetch(
      'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Erreur authentification France Travail : ${response.status} ${error}`,
      );
    }

    const data = await response.json();

    return data.access_token;
  }

  async importLatest(keyword = 'développeur', limit = 3) {
    const accessToken = await this.getAccessToken();

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const params = new URLSearchParams({
      motsCles: keyword,
      publieeDepuis: '1',
      range: `0-${safeLimit - 1}`,
    });

    const response = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Erreur API France Travail : ${response.status} ${error}`,
      );
    }

    const data = await response.json();
    const offers = data.resultats ?? [];

    const savedJobs = [];

    for (const offer of offers) {
      const job = await this.prisma.job.upsert({
        where: {
          source_externalId: {
            source: 'FRANCE_TRAVAIL',
            externalId: offer.id,
          },
        },

        update: {
          title: offer.intitule,
          company: offer.entreprise?.nom ?? null,
          description: offer.description ?? null,

          location: offer.lieuTravail?.libelle ?? null,

          contractType:
            offer.typeContratLibelle ??
            offer.typeContrat ??
            null,

          experience:
            offer.experienceLibelle ?? null,

          salary:
            offer.salaire?.libelle ?? null,

          url:
            offer.origineOffre?.urlOrigine ??
            null,

          sourceCreatedAt: offer.dateCreation
            ? new Date(offer.dateCreation)
            : null,

          sourceUpdatedAt: offer.dateActualisation
            ? new Date(offer.dateActualisation)
            : null,

          raw: offer,
        },

        create: {
          source: 'FRANCE_TRAVAIL',
          externalId: offer.id,

          title: offer.intitule,

          company:
            offer.entreprise?.nom ?? null,

          description:
            offer.description ?? null,

          location:
            offer.lieuTravail?.libelle ?? null,

          department: null,

          contractType:
            offer.typeContratLibelle ??
            offer.typeContrat ??
            null,

          experience:
            offer.experienceLibelle ?? null,

          salary:
            offer.salaire?.libelle ?? null,

          url:
            offer.origineOffre?.urlOrigine ??
            null,

          sourceCreatedAt: offer.dateCreation
            ? new Date(offer.dateCreation)
            : null,

          sourceUpdatedAt: offer.dateActualisation
            ? new Date(offer.dateActualisation)
            : null,

          raw: offer,
        },
      });

      savedJobs.push(job);
    }

    return {
      keyword,
      imported: savedJobs.length,
      jobs: savedJobs,
    };
  }
}