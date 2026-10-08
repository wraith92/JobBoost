import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AutomationService {
  async runFranceTravail() {
    const webhookUrl =
      process.env.N8N_JOBBOOST_WEBHOOK_URL ??
      'http://localhost:5678/webhook/jobboost-morning';

    const response =
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          source:
            'JOBBOOST_UI',
          automation:
            'FRANCE_TRAVAIL',
          requestedAt:
            new Date().toISOString(),
        }),
      });

    if (!response.ok) {
      const error =
        await response.text();

      throw new BadGatewayException(
        `n8n indisponible : ${response.status} ${error}`,
      );
    }

    let n8nResponse:
      unknown = null;

    try {
      n8nResponse =
        await response.json();
    } catch {
      // Webhook "Respond Immediately"
      // peut retourner une réponse vide.
    }

    return {
      started:
        true,
      source:
        'FRANCE_TRAVAIL',
      message:
        'Automatisation France Travail lancée.',
      n8nResponse,
    };
  }
}