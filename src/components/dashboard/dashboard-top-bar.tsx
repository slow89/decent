import { Link } from "@tanstack/react-router";
import { Square, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusMetricData = {
  accent?: boolean;
  label: string;
  value: string;
};

export function DashboardTopBar({
  activeRecipe,
  isOffline,
  isShotRunning,
  liveConnection,
  metrics,
  onToggleShot,
  statusLabel,
}: {
  activeRecipe: string;
  isOffline: boolean;
  isShotRunning: boolean;
  liveConnection: "idle" | "connecting" | "live" | "error";
  metrics: StatusMetricData[];
  onToggleShot: () => void;
  statusLabel: string;
}) {
  return (
    <section className="border-b border-border px-3 py-2.5 md:px-4">
      <div className="grid gap-2 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            asChild
            className="min-h-[38px] min-w-[196px] justify-between rounded-[10px] border-[#35260d] bg-[#0b0c0f] px-3 font-mono text-[0.82rem] font-medium text-foreground hover:bg-[#101216]"
            variant="outline"
          >
            <Link to="/workflows">
              <span className="truncate">{activeRecipe}</span>
              <span className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                Profiles
              </span>
            </Link>
          </Button>
          <Button
            className={cn(
              "min-h-[38px] min-w-[138px] rounded-[10px] border px-3 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.18em]",
              isShotRunning
                ? "border-[#5f3438] bg-[#261316] text-[#ff9b9b] hover:bg-[#31181c]"
                : "border-[#1d5a3d] bg-[#0f2018] text-[#6be79f] hover:bg-[#13281d]",
            )}
            disabled={isOffline}
            onClick={onToggleShot}
          >
            {isShotRunning ? <Square className="size-4" /> : <Zap className="size-4" />}
            {isShotRunning ? "Stop shot" : "Start shot"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 xl:min-w-[420px]">
          {metrics.map((metric) => (
            <StatusMetric
              accent={metric.accent}
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>

        <div className="w-full rounded-[8px] border border-border bg-[#0b0c0f] px-2.5 py-1.5 sm:w-[196px] sm:shrink-0">
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            State
          </p>
          <div className="mt-0.5 flex min-w-0 items-baseline gap-2">
            <p
              className={cn(
                "min-w-0 truncate font-mono text-[0.82rem] font-semibold uppercase tracking-[0.16em]",
                isOffline ? "text-[#f0b37a]" : "text-[#51d193]",
              )}
              title={statusLabel}
            >
              {statusLabel}
            </p>
            <p className="shrink-0 font-mono text-[0.64rem] text-muted-foreground">
              {liveConnection}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusMetric({
  accent,
  label,
  value,
}: {
  accent?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-border bg-[#0b0c0f] px-2.5 py-1.5",
        accent ? "border-[#1f4738] bg-[#0a1712]" : "",
      )}
    >
      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono text-[0.82rem] font-semibold text-foreground",
          accent ? "text-[#6de0a1]" : "",
        )}
      >
        {value}
      </p>
    </div>
  );
}
