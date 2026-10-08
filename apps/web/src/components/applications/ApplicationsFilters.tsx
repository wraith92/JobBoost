import {
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import {
  STATUS_LABELS,
} from './applications.constants';

import type {
  ApplicationStatus,
} from './applications.types';

export default function ApplicationsFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string;

  status:
    ApplicationStatus |
    'ALL';

  onSearchChange:
    (
      value: string,
    ) => void;

  onStatusChange:
    (
      value:
        ApplicationStatus |
        'ALL',
    ) => void;
}) {
  return (
    <section className="applications-filter-shell">

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
          className="text-zinc-400"
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
          placeholder="Poste, entreprise, localisation..."
          className="applications-search-input"
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
            status
          }
          onChange={(
            event,
          ) =>
            onStatusChange(
              event.target
                .value as
                ApplicationStatus |
                'ALL',
            )
          }
          className="applications-filter-select"
        >
          <option value="ALL">
            Tous les statuts
          </option>

          {Object.entries(
            STATUS_LABELS,
          ).map(
            ([
              key,
              label,
            ]) => (
              <option
                key={
                  key
                }
                value={
                  key
                }
              >
                {label}
              </option>
            ),
          )}
        </select>
      </div>
    </section>
  );
}