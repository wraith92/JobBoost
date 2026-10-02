import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import puppeteer from 'puppeteer';

import { PrismaService } from '../prisma/prisma.service.js';

type ResumeContent = {
  candidate: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    github?: string | null;
    linkedin?: string | null;
  };

  summary?: string | null;

  skills: {
    name: string;
    category?: string | null;
    level?: number | null;
  }[];

  experiences: {
    id: string;
    company: string;
    title: string;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    current: boolean;
    description?: string | null;
    bullets: string[];
  }[];

  projects: {
    id: string;
    name: string;
    description?: string | null;
    technologies: string[];
    url?: string | null;
  }[];

  educations: {
    id: string;
    school: string;
    degree: string;
    field?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
  }[];
};

@Injectable()
export class ResumePdfService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async generatePdf(
    resumeId: string,
  ): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
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

    const content =
      resume.content as unknown as ResumeContent;

    if (!content?.candidate) {
      throw new NotFoundException(
        'Contenu du CV introuvable',
      );
    }

    const html = this.buildHtml(
      resume.title,
      content,
    );

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
    waitUntil:
      'load',
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

      const filename =
        this.buildFilename(
          content.candidate.firstName,
          content.candidate.lastName,
          resume.title,
        );

      return {
        buffer:
          Buffer.from(pdf),

        filename,
      };
    } finally {
      await browser.close();
    }
  }

  private buildHtml(
    title: string,
    content: ResumeContent,
  ) {
    const candidate =
      content.candidate;

    const contacts = [
      candidate.location,
      candidate.email,
      candidate.phone,
      candidate.website
        ? 'Portfolio'
        : null,
      candidate.github
        ? 'GitHub'
        : null,
      candidate.linkedin
        ? 'LinkedIn'
        : null,
    ]
      .filter(Boolean)
      .map(
        (value) =>
          this.escapeHtml(
            String(value),
          ),
      )
      .join(
        '<span class="separator">•</span>',
      );

    const skills =
      (content.skills ?? [])
        .map(
          (skill) => `
            <span class="skill">
              ${this.escapeHtml(skill.name)}
            </span>
          `,
        )
        .join('');

    const experiences =
      (content.experiences ?? [])
        .map(
          (experience) => `
            <article class="item">
              <div class="item-header">
                <div>
                  <h3>
                    ${this.escapeHtml(
                      experience.title,
                    )}
                  </h3>

                  <div class="company">
                    ${this.escapeHtml(
                      experience.company,
                    )}
                  </div>
                </div>

                <div class="date">
                  ${this.formatPeriod(
                    experience.startDate,
                    experience.endDate,
                    experience.current,
                  )}

                  ${
                    experience.location
                      ? `<div>${this.escapeHtml(
                          experience.location,
                        )}</div>`
                      : ''
                  }
                </div>
              </div>

              ${
                experience.description
                  ? `
                    <p class="description">
                      ${this.escapeHtml(
                        experience.description,
                      )}
                    </p>
                  `
                  : ''
              }

              ${
                experience.bullets
                  ?.length
                  ? `
                    <ul>
                      ${experience.bullets
                        .map(
                          (bullet) => `
                            <li>
                              ${this.escapeHtml(
                                bullet,
                              )}
                            </li>
                          `,
                        )
                        .join('')}
                    </ul>
                  `
                  : ''
              }
            </article>
          `,
        )
        .join('');

    const projects =
      (content.projects ?? [])
        .map(
          (project) => `
            <article class="item compact">
              <h3>
                ${this.escapeHtml(
                  project.name,
                )}
              </h3>

              ${
                project.description
                  ? `
                    <p class="description">
                      ${this.escapeHtml(
                        project.description,
                      )}
                    </p>
                  `
                  : ''
              }

              ${
                project.technologies
                  ?.length
                  ? `
                    <div class="technologies">
                      ${project.technologies
                        .map(
                          (technology) =>
                            this.escapeHtml(
                              technology,
                            ),
                        )
                        .join(' • ')}
                    </div>
                  `
                  : ''
              }
            </article>
          `,
        )
        .join('');

    const educations =
      (content.educations ?? [])
        .map(
          (education) => `
            <article class="item compact">
              <div class="item-header">
                <div>
                  <h3>
                    ${this.escapeHtml(
                      education.degree,
                    )}
                  </h3>

                  <div class="company">
                    ${this.escapeHtml(
                      education.school,
                    )}

                    ${
                      education.field
                        ? ` — ${this.escapeHtml(
                            education.field,
                          )}`
                        : ''
                    }
                  </div>
                </div>

                <div class="date">
                  ${this.formatPeriod(
                    education.startDate,
                    education.endDate,
                    false,
                  )}
                </div>
              </div>
            </article>
          `,
        )
        .join('');

    return `
<!doctype html>

<html lang="fr">
<head>
  <meta charset="utf-8" />

  <style>
    @page {
  size: A4;
  margin: 12mm 14mm;
}

    * {
      box-sizing: border-box;
    }

   body {
  margin: 0;
  padding: 0;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  color: #1f2937;
  background: #ffffff;

  font-size: 9.5pt;
  line-height: 1.4;
}

.resume {
  width: 100%;
  max-width: 182mm;
  margin: 0 auto;
}

   header {
  padding-bottom: 12px;

  border-bottom:
    2px solid #111827;
}

h1 {
  margin: 0;

  font-size: 22pt;
  line-height: 1.05;

  color: #111827;
}

.headline {
  margin-top: 5px;

  font-size: 12pt;
  font-weight: 600;

  color: #374151;
}

    .contacts {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;

      margin-top: 10px;

      font-size: 8.8pt;
      color: #4b5563;
    }

    .separator {
      margin: 0 4px;
      color: #9ca3af;
    }

   section {
  margin-top: 15px;
}

.section-title {
  margin: 0 0 8px 0;
  padding-bottom: 4px;

  border-bottom: 1px solid #e5e7eb;

  font-size: 9.5pt;
  font-weight: 700;

  letter-spacing: 0.8px;
  text-transform: uppercase;

  color: #111827;
}

    .summary {
      margin: 0;

      color: #374151;
    }

    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .skill {
      padding:
        4px 8px;

      border-radius: 4px;

      background: #f3f4f6;

      font-size: 9pt;
    }

    .item {
      margin-bottom: 14px;

      break-inside: avoid;
      page-break-inside: avoid;
    }

    .compact {
      margin-bottom: 10px;
    }

    .item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 12px;

  width: 100%;
}

.item-header > div:first-child {
  flex: 1;
  min-width: 0;
}

.date {
  width: 34mm;
  flex-shrink: 0;

  text-align: right;

  font-size: 8.5pt;
  line-height: 1.35;

  color: #6b7280;
}

    h3 {
      margin: 0;

      font-size: 10.5pt;
      color: #111827;
    }

    .company {
      margin-top: 2px;

      font-size: 9.5pt;
      font-weight: 600;

      color: #4b5563;
    }

    .date {
      flex-shrink: 0;

      text-align: right;

      font-size: 8.5pt;
      color: #6b7280;
    }

    .description {
      margin:
        5px 0 0 0;

      color: #4b5563;
    }

    ul {
      margin:
        5px 0 0 0;

      padding-left: 18px;
    }

    li {
      margin-bottom: 2px;
    }

    .technologies {
      margin-top: 5px;

      font-size: 8.5pt;

      color: #6b7280;
    }
  </style>
</head>

<body>
  <div class="resume">
    <header>
      <h1>
        ${this.escapeHtml(
          candidate.firstName,
        )}
        ${this.escapeHtml(
          candidate.lastName,
        )}
      </h1>

      <div class="headline">
        ${this.escapeHtml(title)}
      </div>

      <div class="contacts">
        ${contacts}
      </div>
    </header>

    ${
      content.summary
        ? `
          <section>
            <h2 class="section-title">
              Profil
            </h2>

            <p class="summary">
              ${this.escapeHtml(
                content.summary,
              )}
            </p>
          </section>
        `
        : ''
    }

    ${
      skills
        ? `
          <section>
            <h2 class="section-title">
              Compétences pertinentes
            </h2>

            <div class="skills">
              ${skills}
            </div>
          </section>
        `
        : ''
    }

    ${
      experiences
        ? `
          <section>
            <h2 class="section-title">
              Expériences professionnelles
            </h2>

            ${experiences}
          </section>
        `
        : ''
    }

    ${
      projects
        ? `
          <section>
            <h2 class="section-title">
              Projets pertinents
            </h2>

            ${projects}
          </section>
        `
        : ''
    }

    ${
      educations
        ? `
          <section>
            <h2 class="section-title">
              Formation
            </h2>

            ${educations}
          </section>
        `
        : ''
    }
  </div>
</body>
</html>
    `;
  }

  private formatPeriod(
    startDate?: string | null,
    endDate?: string | null,
    current = false,
  ) {
    const format = (
      value?: string | null,
    ) => {
      if (!value) {
        return '';
      }

      return new Intl.DateTimeFormat(
        'fr-FR',
        {
          month: 'short',
          year: 'numeric',
        },
      ).format(
        new Date(value),
      );
    };

    const start =
      format(startDate);

    const end = current
      ? 'Aujourd’hui'
      : format(endDate);

    if (!start && !end) {
      return '';
    }

    if (!end) {
      return this.escapeHtml(
        start,
      );
    }

    return `${this.escapeHtml(
      start,
    )} — ${this.escapeHtml(
      end,
    )}`;
  }

  private buildFilename(
    firstName: string,
    lastName: string,
    title: string,
  ) {
    const value = [
      'CV',
      firstName,
      lastName,
      title,
    ]
      .join('-')
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
      );

    return `${value}.pdf`;
  }

  private escapeHtml(
    value: string,
  ) {
    return value
      .replace(
        /&/g,
        '&amp;',
      )
      .replace(
        /</g,
        '&lt;',
      )
      .replace(
        />/g,
        '&gt;',
      )
      .replace(
        /"/g,
        '&quot;',
      )
      .replace(
        /'/g,
        '&#039;',
      );
  }
}