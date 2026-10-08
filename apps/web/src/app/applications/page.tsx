'use client';

import ApplicationCard
  from '../../components/applications/ApplicationCard';

import ApplicationsFilters
  from '../../components/applications/ApplicationsFilters';

import ApplicationsHeader
  from '../../components/applications/ApplicationsHeader';

import ApplicationsLoading
  from '../../components/applications/ApplicationsLoading';

import ApplicationsPagination
  from '../../components/applications/ApplicationsPagination';

import ApplicationsSummary
  from '../../components/applications/ApplicationsSummary';

import {
  useApplicationsPage,
} from '../../components/applications/useApplicationsPage';

export default function ApplicationsPage() {
  const state =
    useApplicationsPage();

  if (
    state.loading &&
    state.applications.length ===
      0
  ) {
    return (
      <ApplicationsLoading />
    );
  }

  return (
    <main className="applications-page">
      <div
        className="
          applications-container
          space-y-5
        "
      >
        <ApplicationsHeader
          filteredCount={
            state
              .filteredApplications
              .length
          }
          totalCount={
            state
              .applications
              .length
          }
        />

        <ApplicationsSummary
          applications={
            state.applications
          }
        />

        <ApplicationsFilters
          search={
            state.search
          }
          status={
            state.statusFilter
          }
          onSearchChange={
            state.setSearch
          }
          onStatusChange={
            state.setStatusFilter
          }
        />

        {state.error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4 py-3
              text-[11px]
              text-red-700

              dark:border-red-400/15
              dark:bg-red-500/10
              dark:text-red-300
            "
          >
            {state.error}
          </div>
        )}

        <div className="space-y-3">
          {state
            .paginatedApplications
            .map(
              (
                application,
              ) => (
                <ApplicationCard
                  key={
                    application.id
                  }
                  application={
                    application
                  }
                  updating={
                    state
                      .updatingId ===
                    application.id
                  }
                  onStatusChange={
                    state.updateStatus
                  }
                  onSend={
                    state.sendApplication
                  }
                />
              ),
            )}
        </div>

        {state
          .filteredApplications
          .length ===
          0 && (
          <div
            className="
              application-card
              py-14
              text-center
            "
          >
            <p
              className="
                text-[12px]
                font-semibold
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Aucune candidature
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-zinc-400
              "
            >
              Modifiez votre recherche
              ou le filtre de statut.
            </p>
          </div>
        )}

        <ApplicationsPagination
          page={
            state.page
          }
          pageSize={
            state.pageSize
          }
          totalPages={
            state.totalPages
          }
          totalItems={
            state
              .filteredApplications
              .length
          }
          firstItem={
            state.firstItem
          }
          lastItem={
            state.lastItem
          }
          onPageChange={
            state.setPage
          }
          onPageSizeChange={
            state.setPageSize
          }
        />
      </div>
    </main>
  );
}