import type {
  CoverLetter,
} from './cover-letter.types';

export default function CoverLetterDocument({
  letter,
}: {
  letter:
    CoverLetter;
}) {
  const paragraphs =
    letter.content
      .split(
        /\n{2,}/,
      )
      .map(
        (
          paragraph,
        ) =>
          paragraph.trim(),
      )
      .filter(
        Boolean,
      );

  return (
    <article className="cover-letter-document">

      <div
        className="
          border-b
          border-zinc-100
          pb-7

          dark:border-white/[0.07]
        "
      >
        <p
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-violet-600

            dark:text-violet-300
          "
        >
          Lettre de motivation
        </p>

        <h2
          className="
            mt-3
            text-[19px]
            font-semibold
            leading-7
            tracking-[-0.025em]
            text-zinc-950

            dark:text-zinc-50
          "
        >
          {letter.title}
        </h2>

        {letter.job && (
          <p
            className="
              mt-2
              text-[10px]
              text-zinc-400
            "
          >
            Candidature au poste de{' '}
            <span
              className="
                font-medium
                text-zinc-600

                dark:text-zinc-300
              "
            >
              {
                letter.job.title
              }
            </span>

            {letter.job.company
              ? ` chez ${letter.job.company}`
              : ''}
          </p>
        )}
      </div>

      <div className="cover-letter-content">
        {paragraphs.map(
          (
            paragraph,
            index,
          ) => (
            <p
              key={
                index
              }
            >
              {paragraph}
            </p>
          ),
        )}
      </div>

    </article>
  );
}