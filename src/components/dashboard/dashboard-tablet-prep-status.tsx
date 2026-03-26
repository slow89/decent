import type { DashboardPrepStatus } from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";

export function DashboardTabletPrepStatus({
  status,
}: {
  status: DashboardPrepStatus;
}) {
  return (
    <section
      className="rounded-[18px] border border-border bg-panel px-3 py-2.5 md:px-3.5 md:py-2.5"
      data-testid="dashboard-tablet-prep-status"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] md:text-[0.76rem]",
            status.tone === "ready" &&
              "border-status-success-border bg-status-success-surface text-status-success-foreground",
            status.tone === "warming" &&
              "border-highlight/40 bg-highlight/10 text-highlight-muted",
            status.tone === "offline" &&
              "border-status-warning-border bg-status-warning-surface text-status-warning-foreground",
            status.tone === "sleeping" &&
              "border-border bg-panel-muted text-muted-foreground",
          )}
        >
          {status.title}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {status.items.map((item) => (
            <div
              className="min-w-[92px] flex-1 rounded-[12px] border border-border/70 bg-panel-muted px-2.5 py-1.5"
              key={item.label}
            >
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-[0.62rem]">
                {item.label}
              </p>
              <p className="mt-0.5 whitespace-nowrap font-mono text-[0.78rem] font-semibold text-foreground md:text-[0.84rem]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
