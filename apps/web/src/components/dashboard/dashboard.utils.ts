export function formatSource(
  source: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
    FRANCE_TRAVAIL:
      'France Travail',

    JOOBLE:
      'Jooble',

    FREE_WORK:
      'Free-Work',

    ADZUNA:
      'Adzuna',
  };

  return (
    labels[source] ??
    source
  );
}