import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import puppeteer from 'puppeteer';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CoverLetterPdfService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async generatePdf(id: string) {
    const letter =
      await this.prisma.coverLetter.findUnique({
        where: { id },

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

    const html = `
<!doctype html>

<html lang="fr">
<head>
  <meta charset="utf-8" />

  <style>
    @page {
      size: A4;
      margin: 18mm 18mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      color: #1f2937;

      font-size: 11pt;
      line-height: 1.6;
    }

    .header {
      margin-bottom: 30px;
    }

    h1 {
      margin: 0;

      font-size: 20pt;

      color: #111827;
    }

    .headline {
      margin-top: 4px;

      color: #6b7280;

      font-size: 10pt;
    }

    .subject {
      margin-bottom: 28px;

      font-weight: 700;
    }

    .content {
      white-space: pre-line;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>
      Abderrahmane Ben Salah
    </h1>

    <div class="headline">
      Développeur Full-Stack, Data & IA
    </div>
  </div>

  <div class="subject">
    Objet :
    ${this.escapeHtml(letter.title)}
  </div>

  <div class="content">
    ${this.escapeHtml(letter.content)}
  </div>
</body>
</html>
    `;

    const browser =
      await puppeteer.launch({
        headless: true,

        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      });

    try {
      const page =
        await browser.newPage();

      await page.setContent(
        html,
        {
          waitUntil: 'load',
        },
      );

      const pdf =
        await page.pdf({
          format: 'A4',

          printBackground: true,

          preferCSSPageSize: true,

          margin: {
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
          },
        });

      return {
        buffer: Buffer.from(pdf),

        filename:
          `Lettre-Motivation-${letter.job?.title ?? 'Candidature'}`
            .normalize('NFD')
            .replace(
              /[\u0300-\u036f]/g,
              '',
            )
            .replace(
              /[^a-zA-Z0-9]+/g,
              '-',
            )
            .replace(
              /^-+|-+$/g,
              '',
            ) + '.pdf',
      };
    } finally {
      await browser.close();
    }
  }

  private escapeHtml(
    value: string,
  ) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}