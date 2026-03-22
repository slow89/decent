import { Link } from "@tanstack/react-router";
import { Square, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardTopBar({
  activeRecipe,
  isOffline,
  isShotRunning,
  liveConnection,
  onToggleShot,
  statusLabel,
}: {
  activeRecipe: string;
  isOffline: boolean;
  isShotRunning: boolean;
  liveConnection: "idle" | "connecting" | "live" | "error";
  onToggleShot: () => void;
  statusLabel: string;
}) {
  return (
    <section className="shrink-0 border-b border-border px-3 py-2.5 md:px-4">
      <div className="flex items-stretch gap-2">
        <Button
          asChild
          className="h-10 w-[clamp(240px,32vw,360px)] min-w-0 justify-between rounded-[10px] border-[#35260d] bg-[#0b0c0f] px-3 font-mono text-[0.82rem] font-medium text-foreground hover:bg-[#101216]"
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

        <div className="ml-auto flex items-stretch gap-2">
          <Button
            className={cn(
              "h-10 min-w-[138px] rounded-[10px] border px-3 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.18em]",
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

          <div className="flex h-10 w-[236px] shrink-0 items-center justify-between gap-3 rounded-[10px] border border-border bg-[#0b0c0f] px-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="shrink-0 font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Machine
              </p>
              <p
                className={cn(
                  "min-w-0 truncate font-mono text-[0.82rem] font-semibold uppercase tracking-[0.16em]",
                  isOffline ? "text-[#f0b37a]" : "text-[#51d193]",
                )}
                title={statusLabel}
              >
                {statusLabel}
              </p>
            </div>
            <p
              className={cn(
                "shrink-0 font-mono text-[0.64rem] uppercase tracking-[0.12em]",
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

function formatConnectionLabel(liveConnection: "idle" | "connecting" | "live" | "error") {
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
