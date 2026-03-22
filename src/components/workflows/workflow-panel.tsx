import type { ReactNode } from "react";

export function WorkflowPanel({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-[10px] border border-border bg-[#0b0c0f] px-2.5 py-2.5">
      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-0.5 text-[0.78rem] leading-5 text-muted-foreground">{description}</p>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}
