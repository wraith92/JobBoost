import {
  Check,
  X,
} from 'lucide-react';

type Variant =
  | 'neutral'
  | 'success'
  | 'danger'
  | 'technology';

export default function SkillsBlock({
  title,
  skills,
  variant,
}: {
  title: string;

  skills: string[];

  variant: Variant;
}) {
  const styles = {
    neutral:
      `
        border-zinc-200
        bg-zinc-50
        text-zinc-600

        dark:border-white/[0.06]
        dark:bg-white/[0.04]
        dark:text-zinc-300
      `,

    success:
      `
        border-emerald-200
        bg-emerald-50
        text-emerald-700

        dark:border-emerald-400/15
        dark:bg-emerald-500/10
        dark:text-emerald-300
      `,

    danger:
      `
        border-red-200
        bg-red-50
        text-red-700

        dark:border-red-400/15
        dark:bg-red-500/10
        dark:text-red-300
      `,

    technology:
      `
        border-violet-200
        bg-violet-50
        text-violet-700

        dark:border-violet-400/15
        dark:bg-violet-500/10
        dark:text-violet-300
      `,
  };

  return (
    <div>
      <p
        className="
          mb-2
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-zinc-400
        "
      >
        {title}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {skills.map(
          (
            skill,
          ) => (
            <span
              key={
                skill
              }
              className={`
                inline-flex
                items-center
                gap-1
                rounded-lg
                border
                px-2.5 py-1.5
                text-[10px]
                font-medium
                ${styles[
                  variant
                ]}
              `}
            >
              {variant ===
                'success' && (
                <Check
                  size={10}
                />
              )}

              {variant ===
                'danger' && (
                <X
                  size={10}
                />
              )}

              {skill}
            </span>
          ),
        )}
      </div>
    </div>
  );
}