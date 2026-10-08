import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type {
  PageSize,
} from './jobs.types';

function buildPages(
  current: number,
  total: number,
) {
  const numbers:
    number[] = [];

  for (
    let page = 1;
    page <= total;
    page++
  ) {
    if (
      page === 1 ||
      page === total ||
      Math.abs(
        page -
          current,
      ) <= 1
    ) {
      numbers.push(
        page,
      );
    }
  }

  const result:
    (
      | number
      | string
    )[] = [];

  let previous = 0;

  for (
    const page
    of numbers
  ) {
    if (
      page -
        previous >
      1
    ) {
      result.push(
        `ellipsis-${page}`,
      );
    }

    result.push(
      page,
    );

    previous =
      page;
  }

  return result;
}

export default function JobsPagination({
  page,
  pageSize,
  totalPages,
  totalResults,
  firstResult,
  lastResult,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: PageSize;

  totalPages: number;
  totalResults: number;

  firstResult: number;
  lastResult: number;

  onPageChange:
    (
      page: number,
    ) => void;

  onPageSizeChange:
    (
      size: PageSize,
    ) => void;
}) {
  if (
    totalResults === 0
  ) {
    return null;
  }

  const pages =
    buildPages(
      page,
      totalPages,
    );

  return (
    <div
      className="
        jobs-pagination
      "
    >
      <div
        className="
          flex items-center
          gap-3
          text-[10px]
          text-zinc-400
        "
      >
        <span>
          {firstResult}–
          {lastResult}
          {' '}sur{' '}
          {totalResults}
        </span>

        <select
          value={
            pageSize
          }
          onChange={(
            event,
          ) =>
            onPageSizeChange(
              Number(
                event.target
                  .value,
              ) as PageSize,
            )
          }
          className="jobs-page-size"
        >
          <option value={10}>
            10 / page
          </option>

          <option value={20}>
            20 / page
          </option>

          <option value={50}>
            50 / page
          </option>
        </select>
      </div>

      <div
        className="
          flex items-center
          gap-1
        "
      >
        <button
          type="button"
          disabled={
            page <= 1
          }
          onClick={() =>
            onPageChange(
              page - 1,
            )
          }
          className="jobs-page-button"
        >
          <ChevronLeft
            size={14}
          />
        </button>

        {pages.map(
          (
            item,
          ) => {
            if (
              typeof item ===
              'string'
            ) {
              return (
                <span
                  key={
                    item
                  }
                  className="
                    px-1
                    text-zinc-400
                  "
                >
                  …
                </span>
              );
            }

            return (
              <button
                type="button"
                key={
                  item
                }
                onClick={() =>
                  onPageChange(
                    item,
                  )
                }
                className={
                  item ===
                  page
                    ? 'jobs-page-button jobs-page-button-active'
                    : 'jobs-page-button'
                }
              >
                {item}
              </button>
            );
          },
        )}

        <button
          type="button"
          disabled={
            page >=
            totalPages
          }
          onClick={() =>
            onPageChange(
              page + 1,
            )
          }
          className="jobs-page-button"
        >
          <ChevronRight
            size={14}
          />
        </button>
      </div>
    </div>
  );
}