import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function WorkflowPanel({
  children,
  className,
  contentClassName,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[10px] border border-border bg-panel px-2.5 py-2.5",
        className,
      )}
    >
      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-0.5 text-[0.78rem] leading-5 text-muted-foreground">{description}</p>
      <div className={cn("mt-2.5", contentClassName)}>{children}</div>
    </section>
  );
}
