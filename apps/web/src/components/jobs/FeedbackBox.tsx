import type {
  ActionFeedback,
} from './jobs.types';

export default function FeedbackBox({
  feedback,
}: {
  feedback:
    ActionFeedback;
}) {
  const styles = {
    success:
      `
        border-emerald-200
        bg-emerald-50
        text-emerald-700

        dark:border-emerald-400/15
        dark:bg-emerald-500/10
        dark:text-emerald-300
      `,

    error:
      `
        border-red-200
        bg-red-50
        text-red-700

        dark:border-red-400/15
        dark:bg-red-500/10
        dark:text-red-300
      `,

    info:
      `
        border-blue-200
        bg-blue-50
        text-blue-700

        dark:border-blue-400/15
        dark:bg-blue-500/10
        dark:text-blue-300
      `,
  };

  return (
    <div
      className={`
        mt-3
        rounded-xl
        border
        px-3.5 py-3
        text-[11px]
        leading-5
        ${styles[
          feedback.type
        ]}
      `}
    >
      {
        feedback.message
      }
    </div>
  );
}