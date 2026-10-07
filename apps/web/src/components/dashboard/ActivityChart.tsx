'use client';

import {
  useState,
} from 'react';

import type {
  ActivityPoint,
} from './dashboard.types';

export default function ActivityChart({
  data,
}: {
  data:
    ActivityPoint[];
}) {
  const [
    hoveredIndex,
    setHoveredIndex,
  ] = useState<
    number | null
  >(
    null,
  );

  const width =
    1100;

  const height =
    330;

  const paddingLeft =
    52;

  const paddingRight =
    26;

  const paddingTop =
    30;

  const paddingBottom =
    46;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const maxValue =
    Math.max(
      1,
      ...data.flatMap(
        (item) => [
          item.jobs,
          item.analyses,
          item.applications,
        ],
      ),
    );

  const normalizedMax =
    Math.max(
      10,
      Math.ceil(
        maxValue / 10,
      ) * 10,
    );

  function getX(
    index: number,
  ) {
    if (
      data.length <=
      1
    ) {
      return paddingLeft;
    }

    return (
      paddingLeft +
      (
        index /
        (data.length - 1)
      ) *
        chartWidth
    );
  }

  function getY(
    value: number,
  ) {
    return (
      paddingTop +
      chartHeight -
      (
        value /
        normalizedMax
      ) *
        chartHeight
    );
  }

  function createSmoothPath(
    key:
      | 'jobs'
      | 'analyses'
      | 'applications',
  ) {
    if (
      data.length ===
      0
    ) {
      return '';
    }

    const points =
      data.map(
        (
          item,
          index,
        ) => ({
          x:
            getX(
              index,
            ),

          y:
            getY(
              item[key],
            ),
        }),
      );

    if (
      points.length ===
      1
    ) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path =
      `M ${points[0].x} ${points[0].y}`;

    for (
      let index = 0;
      index <
      points.length - 1;
      index++
    ) {
      const current =
        points[index];

      const next =
        points[
          index + 1
        ];

      const middleX =
        (
          current.x +
          next.x
        ) / 2;

      path +=
        ` C ${middleX} ${current.y}, ` +
        `${middleX} ${next.y}, ` +
        `${next.x} ${next.y}`;
    }

    return path;
  }

  function createAreaPath(
    key:
      | 'jobs'
      | 'analyses'
      | 'applications',
  ) {
    if (
      data.length ===
      0
    ) {
      return '';
    }

    const bottom =
      paddingTop +
      chartHeight;

    return (
      `${createSmoothPath(key)} ` +
      `L ${getX(data.length - 1)} ${bottom} ` +
      `L ${getX(0)} ${bottom} Z`
    );
  }

  const hovered =
    hoveredIndex ===
    null
      ? null
      : data[
          hoveredIndex
        ];

  const hoveredX =
    hoveredIndex ===
    null
      ? 0
      : getX(
          hoveredIndex,
        );

  const tooltipX =
    Math.min(
      Math.max(
        hoveredX - 78,
        paddingLeft,
      ),
      width - 190,
    );

  const labelEvery =
    data.length <= 7
      ? 1
      : 5;

  return (
    <div>
      <div
        className="
          mb-5
          flex flex-wrap
          items-center
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex flex-wrap
            gap-5
          "
        >
          <ChartLegend
            label="Offres"
            color="#8b5cf6"
          />

          <ChartLegend
            label="Analyses IA"
            color="#3b82f6"
          />

          <ChartLegend
            label="Candidatures"
            color="#10b981"
          />
        </div>

        <p
          className="
            text-[10px]
            text-zinc-400

            dark:text-zinc-500
          "
        >
          Survolez un point
          pour afficher le détail.
        </p>
      </div>

      <div className="dashboard-chart-shell">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="
              block
              min-w-[760px]
              w-full
            "
          >
            <defs>
              <linearGradient
                id="jobsArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#8b5cf6"
                  stopOpacity="0.22"
                />

                <stop
                  offset="100%"
                  stopColor="#8b5cf6"
                  stopOpacity="0"
                />
              </linearGradient>

              <linearGradient
                id="analysesArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#3b82f6"
                  stopOpacity="0.13"
                />

                <stop
                  offset="100%"
                  stopColor="#3b82f6"
                  stopOpacity="0"
                />
              </linearGradient>

              <linearGradient
                id="applicationsArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#10b981"
                  stopOpacity="0.13"
                />

                <stop
                  offset="100%"
                  stopColor="#10b981"
                  stopOpacity="0"
                />
              </linearGradient>

              <filter
                id="violetGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  stdDeviation="2.5"
                  result="blur"
                />

                <feMerge>
                  <feMergeNode
                    in="blur"
                  />

                  <feMergeNode
                    in="SourceGraphic"
                  />
                </feMerge>
              </filter>
            </defs>

            {Array.from({
              length: 6,
            }).map(
              (
                _,
                index,
              ) => {
                const ratio =
                  index /
                  5;

                const y =
                  paddingTop +
                  ratio *
                    chartHeight;

                const value =
                  Math.round(
                    normalizedMax *
                      (
                        1 -
                        ratio
                      ),
                  );

                return (
                  <g
                    key={
                      index
                    }
                  >
                    <line
                      x1={
                        paddingLeft
                      }
                      x2={
                        width -
                        paddingRight
                      }
                      y1={y}
                      y2={y}
                      className="dashboard-chart-grid"
                      strokeWidth="1"
                      strokeDasharray="4 7"
                    />

                    <text
                      x={
                        paddingLeft -
                        13
                      }
                      y={
                        y + 4
                      }
                      textAnchor="end"
                      fontSize="10"
                      className="dashboard-chart-axis"
                    >
                      {value}
                    </text>
                  </g>
                );
              },
            )}

            <path
              d={
                createAreaPath(
                  'jobs',
                )
              }
              fill="url(#jobsArea)"
            />

            <path
              d={
                createAreaPath(
                  'analyses',
                )
              }
              fill="url(#analysesArea)"
            />

            <path
              d={
                createAreaPath(
                  'applications',
                )
              }
              fill="url(#applicationsArea)"
            />

            <path
              d={
                createSmoothPath(
                  'jobs',
                )
              }
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#violetGlow)"
            />

            <path
              d={
                createSmoothPath(
                  'analyses',
                )
              }
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d={
                createSmoothPath(
                  'applications',
                )
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {hovered && (
              <line
                x1={
                  hoveredX
                }
                x2={
                  hoveredX
                }
                y1={
                  paddingTop
                }
                y2={
                  paddingTop +
                  chartHeight
                }
                className="dashboard-chart-hover-line"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
            )}

            {data.map(
              (
                item,
                index,
              ) => {
                const x =
                  getX(
                    index,
                  );

                const active =
                  index ===
                  hoveredIndex;

                return (
                  <g
                    key={
                      item.date
                    }
                  >
                    <ChartPoint
                      x={x}
                      y={
                        getY(
                          item.jobs,
                        )
                      }
                      color="#8b5cf6"
                      active={
                        active
                      }
                    />

                    <ChartPoint
                      x={x}
                      y={
                        getY(
                          item.analyses,
                        )
                      }
                      color="#3b82f6"
                      active={
                        active
                      }
                    />

                    <ChartPoint
                      x={x}
                      y={
                        getY(
                          item.applications,
                        )
                      }
                      color="#10b981"
                      active={
                        active
                      }
                    />

                    <rect
                      x={
                        x -
                        chartWidth /
                          Math.max(
                            data.length,
                            1,
                          ) /
                          2
                      }
                      y={
                        paddingTop
                      }
                      width={
                        chartWidth /
                        Math.max(
                          data.length -
                            1,
                          1,
                        )
                      }
                      height={
                        chartHeight
                      }
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() =>
                        setHoveredIndex(
                          index,
                        )
                      }
                      onMouseLeave={() =>
                        setHoveredIndex(
                          null,
                        )
                      }
                    />

                    {(index %
                      labelEvery ===
                      0 ||
                      index ===
                        data.length -
                          1) && (
                      <text
                        x={x}
                        y={
                          height -
                          12
                        }
                        textAnchor="middle"
                        fontSize="10"
                        className="dashboard-chart-axis"
                      >
                        {
                          item.label
                        }
                      </text>
                    )}
                  </g>
                );
              },
            )}

            {hovered && (
              <g pointerEvents="none">
                <rect
                  x={
                    tooltipX
                  }
                  y="10"
                  width="166"
                  height="92"
                  rx="12"
                  fill="#18111f"
                  stroke="#3b2846"
                />

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y="32"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                >
                  {
                    hovered.label
                  }
                </text>

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y="52"
                  fill="#c4b5fd"
                  fontSize="10"
                >
                  Offres :{' '}
                  {
                    hovered.jobs
                  }
                </text>

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y="70"
                  fill="#93c5fd"
                  fontSize="10"
                >
                  Analyses IA :{' '}
                  {
                    hovered.analyses
                  }
                </text>

                <text
                  x={
                    tooltipX +
                    14
                  }
                  y="88"
                  fill="#6ee7b7"
                  fontSize="10"
                >
                  Candidatures :{' '}
                  {
                    hovered.applications
                  }
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

function ChartPoint({
  x,
  y,
  color,
  active,
}: {
  x: number;
  y: number;
  color: string;
  active: boolean;
}) {
  return (
    <circle
      cx={x}
      cy={y}
      r={
        active
          ? 5
          : 3.5
      }
      fill={
        color
      }
      stroke="var(--dashboard-chart-point-ring)"
      strokeWidth="2"
    />
  );
}

function ChartLegend({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div
      className="
        flex items-center
        gap-2
      "
    >
      <span
        className="
          h-2 w-2
          rounded-full
        "
        style={{
          backgroundColor:
            color,

          boxShadow:
            `0 0 0 3px ${color}18`,
        }}
      />

      <span
        className="
          text-[11px]
          font-medium
          text-zinc-600

          dark:text-zinc-300
        "
      >
        {label}
      </span>
    </div>
  );
}