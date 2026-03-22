import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, formatRelativeTimestamp } from "@/lib/utils";
import { useShotsQuery } from "@/rest/queries";

export function HistoryPage() {
  const { data: shots = [], isFetching, error, refetch } = useShotsQuery();
  const visibleShots = shots.slice(0, 12);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#d0a954]">
                Session tape
              </p>
              <CardTitle className="mt-2">Shot history</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{visibleShots.length} loaded</Badge>
              <Badge>{isFetching ? "Syncing" : "Ready"}</Badge>
            </div>
          </div>
          <CardDescription>
            The bridge keeps history separate from the legacy app, so this page
            is a clean place to design your own brew journal and filtering
            model.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void refetch()} variant="secondary">
            {isFetching ? "Refreshing..." : "Refresh history"}
          </Button>
          {error ? (
            <span className="font-mono text-[0.72rem] text-destructive">{error.message}</span>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {shots.length === 0 ? (
          <Card>
            <CardHeader>
              <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Queue
              </p>
              <CardTitle>No shots yet</CardTitle>
              <CardDescription>
                Once the bridge returns shot records, they will appear here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          visibleShots.map((shot, index) => (
            <Card
              className="overflow-hidden border-border/70 bg-[#06080b]/96 p-0"
              key={shot.id ?? `${shot.timestamp ?? "shot"}-${index}`}
            >
              <CardContent className="mt-0 grid gap-px bg-border/60 md:grid-cols-[1.05fr_1fr_1fr_0.7fr]">
                <HistoryCell
                  label="Pulled"
                  value={formatRelativeTimestamp(shot.timestamp)}
                />
                <HistoryCell
                  label="Workflow"
                  value={shot.workflow?.name ?? "Unknown workflow"}
                />
                <HistoryCell
                  label="Coffee"
                  value={shot.context?.coffeeName ?? "No coffee metadata"}
                />
                <HistoryCell
                  label="Yield"
                  value={`${formatNumber(shot.weight)} g`}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function HistoryCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#06080b] px-4 py-4">
      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-[0.82rem] font-semibold tracking-[0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}
