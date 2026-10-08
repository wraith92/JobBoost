import {
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import {
  formatSource,
} from './jobs.utils';

export default function JobsFilters({
  search,
  source,
  sources,
  onSearchChange,
  onSourceChange,
}: {
  search: string;
  source: string;

  sources: string[];

  onSearchChange:
    (
      value: string,
    ) => void;

  onSourceChange:
    (
      value: string,
    ) => void;
}) {
  return (
    <section className="jobs-filter-shell">
      <div
        className="
          flex min-w-0
          flex-1
          items-center
          gap-3
        "
      >
        <Search
          size={16}
          className="
            shrink-0
            text-zinc-400
          "
        />

        <input
          type="text"
          value={
            search
          }
          onChange={(
            event,
          ) =>
            onSearchChange(
              event.target
                .value,
            )
          }
          placeholder="Poste, entreprise, technologie, localisation..."
          className="jobs-search-input"
        />
      </div>

      <div
        className="
          hidden
          h-7 w-px
          bg-zinc-200

          dark:bg-white/[0.08]

          md:block
        "
      />

      <div
        className="
          flex items-center
          gap-2
        "
      >
        <SlidersHorizontal
          size={15}
          className="text-zinc-400"
        />

        <select
          value={
            source
          }
          onChange={(
            event,
          ) =>
            onSourceChange(
              event.target
                .value,
            )
          }
          className="jobs-source-select"
        >
          <option value="ALL">
            Toutes les sources
          </option>

          {sources.map(
            (
              item,
            ) => (
              <option
                key={
                  item
                }
                value={
                  item
                }
              >
                {formatSource(
                  item,
                )}
              </option>
            ),
          )}
        </select>
      </div>
    </section>
  );
}