import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildFramePreviewData,
  formatFrameValue,
  formatSeriesKey,
  getNumericValue,
  seriesColors,
  type FrameRecord,
} from "@/lib/workflow-frame-preview";
import { getProfileTitle, joinValues } from "@/lib/workflow-utils";
import { cn } from "@/lib/utils";
import type { WorkflowProfile } from "@/rest/types";

import { WorkflowEmptyState } from "./workflow-empty-state";

export function FramePreviewOverlay({
  onClose,
  profile,
}: {
  onClose: () => void;
  profile: WorkflowProfile;
}) {
  const preview = buildFramePreviewData(profile);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [activeSeriesKeys, setActiveSeriesKeys] = useState(preview.defaultSeriesKeys);
  const selectedFrame = preview.frames[selectedFrameIndex] ?? null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function toggleSeriesKey(key: string) {
    setActiveSeriesKeys((currentKeys) => {
      if (currentKeys.includes(key)) {
        return currentKeys.filter((currentKey) => currentKey !== key);
      }

      if (currentKeys.length < 3) {
        return [...currentKeys, key];
      }

      return [...currentKeys.slice(1), key];
    });
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#030508]/88 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="flex min-h-screen flex-col bg-[#07090b] text-foreground"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-border px-4 py-3 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Frame preview
              </p>
              <h2 className="mt-1 truncate font-display text-[1.5rem] leading-none text-foreground md:text-[1.9rem]">
                {getProfileTitle(profile)}
              </h2>
              <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                {joinValues([
                  profile.author ?? "Unknown author",
                  `${preview.frames.length} frames`,
                ])}
              </p>
            </div>

            <Button
              autoFocus
              className="min-h-[38px] rounded-[10px] border-[#35260d] bg-[#0b0c0f] px-3 font-mono text-[0.72rem] uppercase tracking-[0.18em]"
              onClick={onClose}
              type="button"
              variant="outline"
            >
              <X className="size-4" />
              Close
            </Button>
          </div>
        </header>

        <div className="grid flex-1 gap-4 overflow-y-auto px-4 py-4 md:px-6 md:py-5 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <section className="grid gap-4">
            <div className="rounded-[14px] border border-border bg-[#0b0c0f] p-3 md:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Timeline
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-5 text-muted-foreground">
                    Best-effort preview from numeric fields found across profile frames.
                  </p>
                </div>

                {preview.numericKeys.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {preview.numericKeys.map((key, index) => {
                      const isActive = activeSeriesKeys.includes(key);

                      return (
                        <button
                          key={key}
                          className={cn(
                            "rounded-full border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition",
                            isActive
                              ? "border-transparent text-[#071017]"
                              : "border-border bg-[#090a0c] text-muted-foreground hover:text-foreground",
                          )}
                          onClick={() => toggleSeriesKey(key)}
                          style={
                            isActive
                              ? { backgroundColor: seriesColors[index % seriesColors.length] }
                              : undefined
                          }
                          type="button"
                        >
                          {formatSeriesKey(key)}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                {preview.numericKeys.length > 0 && activeSeriesKeys.length > 0 ? (
                  <FrameSeriesChart
                    activeSeriesKeys={activeSeriesKeys}
                    frames={preview.frames}
                    selectedFrameIndex={selectedFrameIndex}
                  />
                ) : (
                  <WorkflowEmptyState
                    body="No shared numeric frame fields were found, so this profile is shown as structured frame data only."
                    title="No plottable series"
                  />
                )}
              </div>
            </div>

            <div className="rounded-[14px] border border-border bg-[#0b0c0f] p-3 md:p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Frames
                </p>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Frame {selectedFrameIndex + 1} of {preview.frames.length}
                </p>
              </div>
              <div className="mt-3 grid max-h-[220px] grid-cols-4 gap-1.5 overflow-y-auto md:grid-cols-6 xl:grid-cols-8">
                {preview.frames.map((_frame, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-[8px] border px-2 py-2 font-mono text-[0.72rem] transition",
                      selectedFrameIndex === index
                        ? "border-[#27415f] bg-[#132030] text-foreground"
                        : "border-border bg-[#090a0c] text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setSelectedFrameIndex(index)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="rounded-[14px] border border-border bg-[#0b0c0f] p-3 md:p-4">
              <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Selected frame
              </p>
              <div className="mt-3 grid gap-2">
                {selectedFrame ? (
                  Object.entries(selectedFrame).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-[9px] border border-border bg-[#090a0c] px-2.5 py-2"
                    >
                      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {formatSeriesKey(key)}
                      </p>
                      <p className="mt-1 break-words font-mono text-[0.76rem] text-foreground">
                        {formatFrameValue(value)}
                      </p>
                    </div>
                  ))
                ) : (
                  <WorkflowEmptyState body="No frame selected." title="Unavailable" />
                )}
              </div>
            </div>

            <div className="rounded-[14px] border border-border bg-[#0b0c0f] p-3 md:p-4">
              <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Raw frame
              </p>
              <pre className="mt-3 overflow-x-auto rounded-[10px] border border-border bg-[#090a0c] p-3 font-mono text-[0.68rem] leading-5 text-muted-foreground">
                {JSON.stringify(selectedFrame ?? {}, null, 2)}
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FrameSeriesChart({
  activeSeriesKeys,
  frames,
  selectedFrameIndex,
}: {
  activeSeriesKeys: string[];
  frames: FrameRecord[];
  selectedFrameIndex: number;
}) {
  const width = 860;
  const height = 320;
  const margin = { top: 18, right: 18, bottom: 30, left: 28 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const seriesValues = activeSeriesKeys.flatMap((key) =>
    frames
      .map((frame) => getNumericValue(frame[key]))
      .filter((value): value is number => value != null),
  );
  const maxY = Math.max(...seriesValues, 1);

  return (
    <svg
      aria-label="profile frame preview"
      className="h-auto w-full"
      viewBox={`0 0 ${width} ${height}`}
    >
      <rect
        fill="#07090b"
        height={height}
        rx={16}
        stroke="rgba(255, 196, 72, 0.12)"
        width={width}
        x={0}
        y={0}
      />

      {Array.from({ length: 5 }, (_, index) => {
        const y = margin.top + (innerHeight / 4) * index;

        return (
          <line
            key={index}
            stroke="rgba(255, 188, 58, 0.08)"
            x1={margin.left}
            x2={margin.left + innerWidth}
            y1={y}
            y2={y}
          />
        );
      })}

      {activeSeriesKeys.map((key, index) => {
        const points = frames
          .map((frame, frameIndex) => {
            const value = getNumericValue(frame[key]);

            if (value == null) {
              return null;
            }

            const x =
              margin.left +
              (frames.length <= 1
                ? innerWidth / 2
                : (innerWidth / (frames.length - 1)) * frameIndex);
            const y = margin.top + innerHeight - (value / maxY) * innerHeight;

            return { x, y };
          })
          .filter((point): point is { x: number; y: number } => point != null);

        if (points.length < 2) {
          return null;
        }

        return (
          <g key={key}>
            <path
              d={points
                .map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${point.x} ${point.y}`)
                .join(" ")}
              fill="none"
              stroke={seriesColors[index % seriesColors.length]}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
            />
          </g>
        );
      })}

      {frames.length > 0 ? (
        <line
          stroke="rgba(255,255,255,0.2)"
          x1={
            margin.left +
            (frames.length <= 1
              ? innerWidth / 2
              : (innerWidth / (frames.length - 1)) * selectedFrameIndex)
          }
          x2={
            margin.left +
            (frames.length <= 1
              ? innerWidth / 2
              : (innerWidth / (frames.length - 1)) * selectedFrameIndex)
          }
          y1={margin.top}
          y2={margin.top + innerHeight}
        />
      ) : null}

      <text
        fill="var(--muted-foreground)"
        fontFamily="var(--font-mono)"
        fontSize="11"
        x={margin.left}
        y={height - 10}
      >
        Frame index
      </text>
      <text
        fill="var(--muted-foreground)"
        fontFamily="var(--font-mono)"
        fontSize="11"
        x={margin.left}
        y={margin.top - 4}
      >
        Max {maxY.toFixed(1)}
      </text>
    </svg>
  );
}
