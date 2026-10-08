import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type {
  PageSize,
} from './applications.types';

function getPages(
  current: number,
  total: number,
) {
  const values:
    (number | string)[] =
    [];

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
      if (
        typeof values[
          values.length - 1
        ] ===
          'number' &&
        page -
          Number(
            values[
              values.length -
                1
            ],
          ) >
          1
      ) {
        values.push(
          `dots-${page}`,
        );
      }

      values.push(
        page,
      );
    }
  }

  return values;
}

export default function ApplicationsPagination({
  page,
  pageSize,
  totalPages,
  totalItems,
  firstItem,
  lastItem,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;

  pageSize:
    PageSize;

  totalPages:
    number;

  totalItems:
    number;

  firstItem:
    number;

  lastItem:
    number;

  onPageChange:
    (
      value: number,
    ) => void;

  onPageSizeChange:
    (
      value:
        PageSize,
    ) => void;
}) {
  if (
    totalItems === 0
  ) {
    return null;
  }

  return (
    <div className="applications-pagination">

      <div
        className="
          flex items-center
          gap-3
          text-[10px]
          text-zinc-400
        "
      >
        <span>
          {firstItem}–
          {lastItem}
          {' '}sur{' '}
          {totalItems}
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
          className="applications-page-size"
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
          className="applications-page-button"
        >
          <ChevronLeft
            size={14}
          />
        </button>

        {getPages(
          page,
          totalPages,
        ).map(
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
                    ? 'applications-page-button applications-page-button-active'
                    : 'applications-page-button'
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
          className="applications-page-button"
        >
          <ChevronRight
            size={14}
          />
        </button>
      </div>
    </div>
  );
}