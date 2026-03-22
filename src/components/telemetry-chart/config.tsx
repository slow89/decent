import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  telemetryFamilyLabels,
  telemetryFamilyOrder,
  telemetrySeriesRegistry,
  type TelemetrySeriesFamily,
  type TelemetrySeriesId,
} from "@/lib/telemetry";

import type {
  SelectableTelemetryChartPreset,
  TelemetryChartPreset,
} from "./shared";

export function TelemetryConfigOverlay({
  activePreset,
  laneVisibility,
  onClose,
  onReset,
  onSetPreset,
  onToggleLane,
  onToggleSeries,
  selectedSeriesIds,
}: {
  activePreset: TelemetryChartPreset;
  laneVisibility: Record<TelemetrySeriesFamily, boolean>;
  onClose: () => void;
  onReset: () => void;
  onSetPreset: (preset: SelectableTelemetryChartPreset) => void;
  onToggleLane: (family: TelemetrySeriesFamily) => void;
  onToggleSeries: (seriesId: TelemetrySeriesId) => void;
  selectedSeriesIds: TelemetrySeriesId[];
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#030508]/88 backdrop-blur-sm xl:hidden"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="absolute inset-3 flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-border bg-[#080b10] p-3 shadow-2xl sm:inset-4 sm:p-4"
        data-testid="telemetry-config-overlay"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[#d7a84b]">
              Chart controls
            </p>
            <p className="mt-1 text-[0.72rem] leading-5 text-muted-foreground">
              Presets, lanes, and visible signals.
            </p>
          </div>
          <button
            aria-label="Close chart controls"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border bg-[#0b0d10] text-muted-foreground transition hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          <TelemetryConfigPanel
            activePreset={activePreset}
            laneVisibility={laneVisibility}
            onReset={onReset}
            onSetPreset={onSetPreset}
            onToggleLane={onToggleLane}
            onToggleSeries={onToggleSeries}
            selectedSeriesIds={selectedSeriesIds}
          />
        </div>
      </div>
    </div>
  );
}

export function TelemetryConfigPanel({
  activePreset,
  laneVisibility,
  onReset,
  onSetPreset,
  onToggleLane,
  onToggleSeries,
  selectedSeriesIds,
}: {
  activePreset: TelemetryChartPreset;
  laneVisibility: Record<TelemetrySeriesFamily, boolean>;
  onReset: () => void;
  onSetPreset: (preset: SelectableTelemetryChartPreset) => void;
  onToggleLane: (family: TelemetrySeriesFamily) => void;
  onToggleSeries: (seriesId: TelemetrySeriesId) => void;
  selectedSeriesIds: TelemetrySeriesId[];
}) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-[#0a0d11] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Configuration
        </p>
        <button
          className="rounded-full border border-border bg-[#0b0d10] px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground transition hover:border-[#5a4419] hover:text-foreground"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className="mt-3 grid gap-3">
        <div>
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#d7a84b]">
            Presets
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <PresetButton
              active={activePreset === "live-shot"}
              label="Live shot"
              onClick={() => onSetPreset("live-shot")}
            />
            <PresetButton
              active={activePreset === "all-signals"}
              label="All signals"
              onClick={() => onSetPreset("all-signals")}
            />
          </div>
        </div>

        <div>
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#d7a84b]">
            Lanes
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {telemetryFamilyOrder.map((family) => (
              <button
                className={cn(
                  "flex min-h-[42px] items-center justify-between rounded-[11px] border px-2.5 py-2 text-left transition",
                  laneVisibility[family]
                    ? "border-[#4a3816] bg-[#15100a] text-foreground"
                    : "border-border bg-[#0c1014] text-muted-foreground hover:text-foreground",
                )}
                key={family}
                onClick={() => onToggleLane(family)}
                type="button"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                  {telemetryFamilyLabels[family]}
                </span>
                <span className="font-mono text-[0.54rem] uppercase tracking-[0.14em]">
                  {laneVisibility[family] ? "On" : "Off"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          {telemetryFamilyOrder.map((family) => {
            const familySeries = telemetrySeriesRegistry.filter(
              (series) => series.family === family,
            );

            return (
              <div key={family}>
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#d7a84b]">
                  {telemetryFamilyLabels[family]}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {familySeries.map((series) => {
                    const isActive = selectedSeriesIds.includes(series.id);

                    return (
                      <button
                        className={cn(
                          "rounded-full border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.14em] transition",
                          isActive
                            ? "text-[#071017]"
                            : "border-border bg-[#090c10] text-muted-foreground hover:text-foreground",
                        )}
                        key={series.id}
                        onClick={() => onToggleSeries(series.id)}
                        style={isActive ? { backgroundColor: series.color } : undefined}
                        type="button"
                      >
                        {series.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PresetButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.16em] whitespace-nowrap transition",
        active
          ? "border-transparent bg-[#f0be57] text-[#120c00]"
          : "border-border bg-[#0b0d10] text-muted-foreground hover:border-[#5a4419] hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
