'use client';

import {
  Bot,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

import {
  AUTOMATION_SOURCES,
} from './automation.constants';

import type {
  AutomationFeedItem,
} from './automation.types';

import AutomationFeed
  from './AutomationFeed';

import AutomationSourceCard
  from './AutomationSourceCard';

export default function JobsAutomationPanel({
  open,

  running,

  feed,

  onToggle,

  onRunFranceTravail,

  onClearFeed,
}: {
  open:
    boolean;

  running:
    boolean;

  feed:
    AutomationFeedItem[];

  onToggle:
    () => void;

  onRunFranceTravail:
    () => void;

  onClearFeed:
    () => void;
}) {
  return (
    <section className="jobs-automation-panel">

      <button
        type="button"
        onClick={
          onToggle
        }
        className="jobs-automation-panel-header"
      >
        <div
          className="
            flex items-center
            gap-3
          "
        >
          <div className="jobs-automation-main-icon">
            <Bot
              size={16}
            />
          </div>

          <div
            className="
              text-left
            "
          >
            <div
              className="
                flex flex-wrap
                items-center
                gap-2
              "
            >
              <h2
                className="
                  text-[12px]
                  font-semibold
                  text-zinc-900

                  dark:text-zinc-100
                "
              >
                Automatisation des offres
              </h2>

              <span className="automation-daily-badge">
                <CalendarClock
                  size={9}
                />

                Quotidien
              </span>
            </div>

            <p
              className="
                mt-1
                text-[9.5px]
                text-zinc-400
              "
            >
              Centralise les nouvelles offres
              et prépare leur analyse automatiquement.
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp
            size={15}
            className="
              text-zinc-400
            "
          />
        ) : (
          <ChevronDown
            size={15}
            className="
              text-zinc-400
            "
          />
        )}
      </button>

      {open && (
        <div className="jobs-automation-panel-content">

          <div
            className="
              grid gap-3

              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            {AUTOMATION_SOURCES.map(
              (
                source,
              ) => (
                <AutomationSourceCard
                  key={
                    source.id
                  }
                  source={
                    source
                  }
                  running={
                    running &&
                    source.id ===
                      'FRANCE_TRAVAIL'
                  }
                  onRun={
                    onRunFranceTravail
                  }
                />
              ),
            )}
          </div>

          <div
            className="
              mt-5
            "
          >
            <div
              className="
                mb-2
                flex justify-end
              "
            >
              {feed.length >
                0 &&
                !running && (
                <button
                  type="button"
                  onClick={
                    onClearFeed
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5

                    text-[9px]
                    font-semibold
                    text-zinc-400

                    hover:text-violet-500
                  "
                >
                  <RotateCcw
                    size={10}
                  />

                  Effacer le flux
                </button>
              )}
            </div>

            <AutomationFeed
              items={
                feed
              }
              running={
                running
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}