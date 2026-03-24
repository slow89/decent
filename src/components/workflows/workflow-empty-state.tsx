export function WorkflowEmptyState({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <div className="rounded-[10px] border border-dashed border-border bg-panel-muted px-3 py-3.5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-highlight-muted">
        {title}
      </p>
      <p className="mt-1.5 text-[0.8rem] leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}
