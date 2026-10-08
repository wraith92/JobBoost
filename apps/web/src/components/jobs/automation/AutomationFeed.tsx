'use client';

import {
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Database,
  LoaderCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';

import type {
  AutomationFeedItem,
  AutomationFeedStatus,
} from './automation.types';

export default function AutomationFeed({
  items,

  running,
}: {
  items:
    AutomationFeedItem[];

  running:
    boolean;
}) {
  return (
    <section className="automation-feed">

      <div
        className="
          flex items-center
          justify-between
          gap-4
        "
      >
        <div>
          <div
            className="
              flex items-center
              gap-2
            "
          >
            <Sparkles
              size={13}
              className="
                text-violet-500
              "
            />

            <h3
              className="
                text-[11px]
                font-semibold
                text-zinc-900

                dark:text-zinc-100
              "
            >
              Flux d&apos;import
            </h3>
          </div>

          <p
            className="
              mt-1
              text-[9px]
              text-zinc-400
            "
          >
            Les nouvelles offres apparaissent
            ici au fur et à mesure.
          </p>
        </div>

        {running && (
          <div
            className="
              automation-live-badge
            "
          >
            <span className="automation-live-dot" />

            En direct
          </div>
        )}
      </div>

      <div
        className="
          mt-4
          space-y-2
        "
      >
        {items.length ===
          0 && (
          <div className="automation-feed-empty">
            {running ? (
              <>
                <LoaderCircle
                  size={20}
                  className="
                    animate-spin
                    text-violet-500
                  "
                />

                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      text-zinc-700

                      dark:text-zinc-300
                    "
                  >
                    Recherche des nouvelles offres...
                  </p>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      text-zinc-400
                    "
                  >
                    Connexion à France Travail.
                  </p>
                </div>
              </>
            ) : (
              <>
                <BriefcaseBusiness
                  size={19}
                  className="
                    text-zinc-300

                    dark:text-zinc-600
                  "
                />

                <p
                  className="
                    text-[9.5px]
                    text-zinc-400
                  "
                >
                  Aucune collecte en cours.
                </p>
              </>
            )}
          </div>
        )}

        {items.map(
          (
            item,
          ) => (
            <AutomationFeedRow
              key={
                item.id
              }
              item={
                item
              }
            />
          ),
        )}
      </div>
    </section>
  );
}

function AutomationFeedRow({
  item,
}: {
  item:
    AutomationFeedItem;
}) {
  const meta =
    getStatusMeta(
      item.status,
    );

  const Icon =
    meta.icon;

  return (
    <article className="automation-feed-row">
      <div
        className={`
          automation-feed-status-icon
          ${meta.className}
        `}
      >
        <Icon
          size={13}
          className={
            item.status ===
            'collecting'
              ? 'animate-spin'
              : ''
          }
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex flex-wrap
            items-center
            gap-x-2
            gap-y-1
          "
        >
          <h4
            className="
              truncate
              text-[10px]
              font-semibold
              text-zinc-800

              dark:text-zinc-200
            "
          >
            {item.title}
          </h4>

          <span
            className="
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-violet-500
            "
          >
            France Travail
          </span>
        </div>

        <div
          className="
            mt-1
            flex flex-wrap
            items-center
            gap-x-3
            gap-y-1

            text-[8.5px]
            text-zinc-400
          "
        >
          {item.company && (
            <span>
              {item.company}
            </span>
          )}

          {item.location && (
            <span
              className="
                inline-flex
                items-center
                gap-1
              "
            >
              <MapPin
                size={8}
              />

              {item.location}
            </span>
          )}

          {item.externalId && (
            <span>
              #{item.externalId}
            </span>
          )}
        </div>

        {item.message && (
          <p
            className="
              mt-1.5
              text-[8.5px]
              text-zinc-400
            "
          >
            {item.message}
          </p>
        )}
      </div>

      <div
        className="
          shrink-0
          text-right
        "
      >
        <span
          className="
            text-[8.5px]
            font-semibold
            text-zinc-500

            dark:text-zinc-400
          "
        >
          {meta.label}
        </span>

        {item.score !==
          undefined &&
          item.score !==
            null && (
          <p
            className="
              mt-1
              text-[10px]
              font-bold
              text-violet-500
            "
          >
            {item.score}%
          </p>
        )}
      </div>
    </article>
  );
}

function getStatusMeta(
  status:
    AutomationFeedStatus,
) {
  switch (
    status
  ) {
    case 'collecting':
      return {
        label:
          'Import',

        icon:
          LoaderCircle,

        className:
          'automation-feed-status-loading',
      };

    case 'imported':
      return {
        label:
          'Ajoutée',

        icon:
          Database,

        className:
          'automation-feed-status-imported',
      };

    case 'analyzing':
      return {
        label:
          'Analyse IA',

        icon:
          BrainCircuit,

        className:
          'automation-feed-status-analyzing',
      };

    case 'ready':
      return {
        label:
          'Prête',

        icon:
          CheckCircle2,

        className:
          'automation-feed-status-ready',
      };

    case 'error':
      return {
        label:
          'Erreur',

        icon:
          CircleAlert,

        className:
          'automation-feed-status-error',
      };
  }
}