export default function ResumeSummarySection({
  summary,
}: {
  summary:
    | string
    | null;
}) {
  if (!summary) {
    return null;
  }

  return (
    <section className="resume-section">
      <h3 className="resume-section-title">
        Profil
      </h3>

      <p
        className="
          mt-3
          text-[11px]
          leading-[1.75]
          text-zinc-600

          dark:text-zinc-300
        "
      >
        {summary}
      </p>
    </section>
  );
}