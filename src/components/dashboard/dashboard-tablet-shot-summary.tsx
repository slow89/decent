export type DashboardShotSummaryItem = {
  label: string;
  value: string;
};

export function DashboardTabletShotSummary({
  items,
}: {
  items: ReadonlyArray<DashboardShotSummaryItem>;
}) {
  return (
    <div
      className="rounded-[18px] border border-border/70 bg-panel p-2 md:p-2.5"
      data-testid="dashboard-shot-summary"
    >
      <div className="grid grid-cols-2 gap-2 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.8fr))]">
        {items.map((item) => (
          <div
            className="min-w-0 rounded-[12px] border border-border/60 bg-panel-muted px-2.5 py-1.5 md:px-3"
            key={item.label}
          >
            <p className="truncate font-mono text-[0.5rem] font-medium uppercase tracking-[0.16em] text-muted-foreground md:text-[0.54rem]">
              {item.label}
            </p>
            <p className="mt-0.5 truncate font-mono text-[0.76rem] font-semibold text-foreground md:text-[0.82rem]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
