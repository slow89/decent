import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDevicesQuery, useScanDevicesMutation } from "@/rest/queries";

export function DevicesPage() {
  const { data: devices = [], isFetching, error, refetch } = useDevicesQuery();
  const scanMutation = useScanDevicesMutation();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-highlight">
                Machine bus
              </p>
              <CardTitle className="mt-2">Devices</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{devices.length} tracked</Badge>
              <Badge>{scanMutation.isPending ? "Scanning" : "Standing by"}</Badge>
            </div>
          </div>
          <CardDescription>
            Streamline Bridge already owns scan and connection policy. The skin
            should mostly visualize state and let the bridge stay authoritative.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void refetch()} variant="secondary">
            Refresh list
          </Button>
          <Button onClick={() => void scanMutation.mutateAsync()}>
            {scanMutation.isPending ? "Scanning..." : "Scan and connect"}
          </Button>
          {error ? (
            <span className="font-mono text-[0.72rem] text-destructive">{error.message}</span>
          ) : null}
          {scanMutation.error ? (
            <span className="font-mono text-[0.72rem] text-destructive">
              {scanMutation.error.message}
            </span>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => (
          <Card className="bg-panel" key={device.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {device.type}
                  </p>
                  <CardTitle className="mt-2 text-[1.3rem]">{device.name}</CardTitle>
                </div>
                <Badge variant={device.state === "connected" ? "default" : "secondary"}>
                  {device.state}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <DeviceRow label="State" value={device.state} />
              <DeviceRow label="ID" value={device.id} />
            </CardContent>
          </Card>
        ))}

        {devices.length === 0 && !isFetching ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle>No discovered devices</CardTitle>
              <CardDescription>
                Use scan to let the bridge discover and connect preferred
                machine and scale devices.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function DeviceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-background/50 p-4">
      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-all font-mono text-[0.8rem] font-semibold tracking-[0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}
