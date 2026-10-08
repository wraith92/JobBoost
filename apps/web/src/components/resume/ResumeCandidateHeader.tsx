import {
    Code2,
    Globe2,
    Mail,
    MapPin,
    Network,
    Phone,
} from 'lucide-react';
import type {
    Resume,
} from './resume.types';

import {
    normalizeExternalUrl,
} from './resume.utils';

export default function ResumeCandidateHeader({
    resume,
}: {
    resume: Resume;
}) {
    const candidate =
        resume.content
            .candidate;

    return (
        <header className="resume-candidate-header">
            <div>
                <h2
                    className="
            text-[30px]
            font-semibold
            tracking-[-0.04em]
            text-zinc-950

            dark:text-zinc-50
          "
                >
                    {
                        candidate.firstName
                    }{' '}
                    {
                        candidate.lastName
                    }
                </h2>

                <p
                    className="
            mt-1
            text-[15px]
            font-medium
            text-violet-600

            dark:text-violet-300
          "
                >
                    {resume.title}
                </p>
            </div>

            <div
                className="
          mt-5
          flex flex-wrap
          gap-x-4
          gap-y-2
        "
            >
                {candidate.location && (
                    <ContactItem
                        icon={
                            MapPin
                        }
                        label={
                            candidate.location
                        }
                    />
                )}

                {candidate.email && (
                    <ContactItem
                        icon={
                            Mail
                        }
                        label={
                            candidate.email
                        }
                        href={`mailto:${candidate.email}`}
                    />
                )}

                {candidate.phone && (
                    <ContactItem
                        icon={
                            Phone
                        }
                        label={
                            candidate.phone
                        }
                        href={`tel:${candidate.phone}`}
                    />
                )}

                {candidate.website && (
                    <ContactItem
                        icon={
                            Globe2
                        }
                        label="Portfolio"
                        href={
                            normalizeExternalUrl(
                                candidate.website,
                            ) ??
                            undefined
                        }
                    />
                )}

                {candidate.github && (
                    <ContactItem
                        icon={Code2}
                        label="GitHub"
                        href={
                            normalizeExternalUrl(
                                candidate.github,
                            ) ?? undefined
                        }
                    />
                )}

                {candidate.linkedin && (
                    <ContactItem
                        icon={Network}
                        label="LinkedIn"
                        href={
                            normalizeExternalUrl(
                                candidate.linkedin,
                            ) ?? undefined
                        }
                    />
                )}
            </div>
        </header>
    );
}

function ContactItem({
    icon: Icon,
    label,
    href,
}: {
    icon:
    typeof Mail;

    label: string;

    href?: string;
}) {
    const content = (
        <>
            <Icon
                size={11}
            />

            <span>
                {label}
            </span>
        </>
    );

    if (
        href
    ) {
        return (
            <a
                href={
                    href
                }
                target={
                    href.startsWith(
                        'http',
                    )
                        ? '_blank'
                        : undefined
                }
                rel={
                    href.startsWith(
                        'http',
                    )
                        ? 'noreferrer'
                        : undefined
                }
                className="resume-contact-item"
            >
                {content}
            </a>
        );
    }

    return (
        <span className="resume-contact-item">
            {content}
        </span>
    );
}