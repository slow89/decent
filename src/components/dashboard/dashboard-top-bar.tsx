import { Link } from "@tanstack/react-router";
import { Droplets, Scale, Square, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LiveConnectionState } from "@/stores/machine-store";

export function DashboardTopBar({
  activeRecipe,
  isOffline,
  isScalePaired,
  isScaleTaring,
  isScaleWeightActionDisabled,
  isShotRunning,
  liveConnection,
  onSetDoseFromScale,
  onTareScale,
  onToggleShot,
  reservoirLevel,
  reservoirRefillLevel,
  scaleBatteryLevel,
  scaleConnection,
  scaleWeight,
  statusLabel,
}: {
  activeRecipe: string;
  isOffline: boolean;
  isScalePaired: boolean;
  isScaleTaring: boolean;
  isScaleWeightActionDisabled: boolean;
  isShotRunning: boolean;
  liveConnection: LiveConnectionState;
  onSetDoseFromScale: () => void;
  onTareScale: () => void;
  onToggleShot: () => void;
  reservoirLevel: number | null;
  reservoirRefillLevel: number | null;
  scaleBatteryLevel: number | null;
  scaleConnection: LiveConnectionState;
  scaleWeight: number | null;
  statusLabel: string;
}) {
  return (
    <section className="shrink-0 border-b border-border px-3 py-1.5 md:px-4">
      <div className="flex flex-wrap items-stretch gap-1.5">
        <Button
          asChild
          className="h-auto min-h-9 min-w-[220px] flex-1 justify-between rounded-[10px] border-[#35260d] bg-[#0b0c0f] px-3 py-1.5 font-mono text-[0.76rem] font-medium text-foreground hover:bg-[#101216] md:max-w-[340px] md:flex-none"
          size="sm"
          variant="outline"
        >
          <Link to="/workflows">
            <span className="min-w-0 truncate">{activeRecipe}</span>
            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              Profiles
            </span>
          </Link>
        </Button>

        <ReservoirStatusCard
          reservoirLevel={reservoirLevel}
          reservoirRefillLevel={reservoirRefillLevel}
        />

        <ScaleStatusCard
          batteryLevel={scaleBatteryLevel}
          isPaired={isScalePaired}
          isTaring={isScaleTaring}
          isWeightActionDisabled={isScaleWeightActionDisabled}
          onSetDoseFromScale={onSetDoseFromScale}
          onTareScale={onTareScale}
          scaleConnection={scaleConnection}
          weight={scaleWeight}
        />

        <div className="flex min-w-[280px] flex-1 items-stretch justify-end gap-1.5 md:ml-auto md:flex-none">
          <Button
            className={cn(
              "h-auto min-h-9 min-w-[120px] rounded-[10px] border px-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em]",
              isShotRunning
                ? "border-[#5f3438] bg-[#261316] text-[#ff9b9b] hover:bg-[#31181c]"
                : "border-[#1d5a3d] bg-[#0f2018] text-[#6be79f] hover:bg-[#13281d]",
            )}
            disabled={isOffline}
            onClick={onToggleShot}
            size="sm"
          >
            {isShotRunning ? <Square className="size-4" /> : <Zap className="size-4" />}
            {isShotRunning ? "Stop shot" : "Start shot"}
          </Button>

          <div className="flex min-h-9 min-w-[200px] shrink-0 items-center justify-between gap-3 rounded-[10px] border border-border bg-[#0b0c0f] px-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="shrink-0 font-mono text-[0.54rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Machine
              </p>
              <p
                className={cn(
                  "min-w-0 truncate font-mono text-[0.74rem] font-semibold uppercase tracking-[0.14em]",
                  isOffline ? "text-[#f0b37a]" : "text-[#51d193]",
                )}
                title={statusLabel}
              >
                {statusLabel}
              </p>
            </div>
            <p
              className={cn(
                "shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.1em]",
                isOffline ? "text-[#f0b37a]" : "text-foreground",
              )}
            >
              {formatConnectionLabel(liveConnection)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReservoirStatusCard({
  reservoirLevel,
  reservoirRefillLevel,
}: {
  reservoirLevel: number | null;
  reservoirRefillLevel: number | null;
}) {
  const level = clampPercentage(reservoirLevel);
  const refillLevel = clampPercentage(reservoirRefillLevel);
  const isLow = level != null && refillLevel != null && level <= refillLevel;

  return (
    <div className="min-w-[148px] flex-1 rounded-[10px] border border-[#3a2b11] bg-[#0b0c0f] px-3 py-1.5 md:max-w-[176px] md:flex-none">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-mono text-[0.54rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Droplets className="size-3 text-[#d99826]" />
          Reservoir
        </p>
        <p
          className={cn(
            "font-mono text-[0.8rem] font-semibold",
            isLow ? "text-[#ffb16c]" : "text-foreground",
          )}
        >
          {formatPercentage(level)}
        </p>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="relative h-2.5 flex-1 rounded-full border border-[#6a511f] bg-[#17110a] p-[1px]">
            {refillLevel != null ? (
              <div
                className="absolute inset-y-[1px] w-px bg-[#f0b37a]/90"
                style={{ left: `${refillLevel}%` }}
              />
            ) : null}
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                level == null
                  ? "w-[14%] bg-[#3c3325]"
                  : isLow
                    ? "bg-[#f08c4f]"
                    : level < 35
                      ? "bg-[#d99826]"
                      : "bg-[#6be79f]",
              )}
              style={{ width: `${level ?? 14}%` }}
            />
          </div>
          <div
            className={cn(
              "ml-1 h-2 w-1 rounded-r-full border border-l-0 border-[#6a511f]",
              isLow ? "bg-[#f08c4f]" : "bg-[#2c2113]",
            )}
          />
        </div>
        <p className="shrink-0 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-muted-foreground">
          {level == null
            ? "No feed"
            : isLow
              ? "Refill"
              : refillLevel == null
                ? "OK"
                : `${refillLevel.toFixed(0)}%`}
        </p>
      </div>
    </div>
  );
}

function ScaleStatusCard({
  batteryLevel,
  isPaired,
  isTaring,
  isWeightActionDisabled,
  onSetDoseFromScale,
  onTareScale,
  scaleConnection,
  weight,
}: {
  batteryLevel: number | null;
  isPaired: boolean;
  isTaring: boolean;
  isWeightActionDisabled: boolean;
  onSetDoseFromScale: () => void;
  onTareScale: () => void;
  scaleConnection: LiveConnectionState;
  weight: number | null;
}) {
  return (
    <div className="min-w-[236px] flex-[1.05] rounded-[10px] border border-[#263447] bg-[#0b0c0f] px-3 py-1.5 md:max-w-[300px] md:flex-none">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[0.54rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <Scale className="size-3 text-[#66c9ff]" />
            Scale
          </p>
          <p
            className={cn(
              "mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em]",
              isPaired ? "text-[#66c9ff]" : "text-[#f0b37a]",
            )}
          >
            {getScaleStatusLabel(isPaired, scaleConnection)}
          </p>
        </div>

        {batteryLevel != null ? (
          <p className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
            {batteryLevel.toFixed(0)}%
          </p>
        ) : null}
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-mono text-[0.96rem] font-semibold text-foreground">
          {formatScaleWeight(weight)}
        </p>
        <div className="grid shrink-0 grid-cols-2 gap-1.5">
          <Button
            className="h-7 rounded-[8px] border-[#21425f] bg-[#0f1823] px-2 text-[0.56rem] text-[#cbe9ff] hover:bg-[#132131]"
            disabled={!isPaired || isTaring}
            onClick={onTareScale}
            size="sm"
            variant="outline"
          >
            {isTaring ? "Taring" : "Tare"}
          </Button>
          <Button
            className="h-7 rounded-[8px] border-[#355d47] bg-[#112018] px-2 text-[0.56rem] text-[#a8efbe] hover:bg-[#162b20]"
            disabled={isWeightActionDisabled}
            onClick={onSetDoseFromScale}
            size="sm"
            variant="outline"
          >
            Use dose
          </Button>
        </div>
      </div>
    </div>
  );
}

function clampPercentage(value: number | null) {
  if (value == null || Number.isNaN(value)) {
    return null;
  }

  return Math.min(100, Math.max(0, value));
}

function formatPercentage(value: number | null) {
  if (value == null) {
    return "--";
  }

  return `${value.toFixed(0)}%`;
}

function formatScaleWeight(weight: number | null) {
  if (weight == null || Number.isNaN(weight)) {
    return "--.- g";
  }

  return `${weight.toFixed(1)} g`;
}

function getScaleStatusLabel(
  isPaired: boolean,
  scaleConnection: LiveConnectionState,
) {
  if (!isPaired && scaleConnection === "connecting") {
    return "Looking";
  }

  if (!isPaired) {
    return "Unpaired";
  }

  if (scaleConnection === "connecting") {
    return "Pairing";
  }

  if (scaleConnection === "error") {
    return "Stream lost";
  }

  return "Paired";
}

function formatConnectionLabel(liveConnection: LiveConnectionState) {
  if (liveConnection === "live") {
    return "Stream live";
  }

  if (liveConnection === "connecting") {
    return "Connecting";
  }

  if (liveConnection === "error") {
    return "Stream error";
  }

  return "Standby";
}
