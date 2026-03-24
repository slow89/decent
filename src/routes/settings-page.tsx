import { useState, type ReactNode } from "react";

import { useRouter } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toWebSocketUrl } from "@/rest/client";
import { queryClient } from "@/rest/query-client";
import { useDevicesQuery, bridgeQueryKeys } from "@/rest/queries";
import type { DeviceSummary } from "@/rest/types";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";

export function SettingsPage() {
  const router = useRouter();
  const gatewayUrl = useBridgeConfigStore((state) => state.gatewayUrl);
  const setGatewayUrl = useBridgeConfigStore((state) => state.setGatewayUrl);
  const [draftGatewayUrl, setDraftGatewayUrl] = useState(gatewayUrl);
  const {
    data: devices = [],
    error: devicesError,
    isFetching: isFetchingDevices,
  } = useDevicesQuery();

  const endpointRows = [
    { label: "REST origin", value: gatewayUrl },
    {
      label: "Machine snapshot",
      value: `${toWebSocketUrl(gatewayUrl)}/ws/v1/machine/snapshot`,
    },
    { label: "Workflow API", value: `${gatewayUrl}/api/v1/workflow` },
    { label: "Devices API", value: `${gatewayUrl}/api/v1/devices` },
  ];

  async function handleSave() {
    setGatewayUrl(draftGatewayUrl);
    await queryClient.invalidateQueries({
      queryKey: bridgeQueryKeys.all,
    });
    await router.invalidate();
  }

  return (
    <div>
      <div className="panel min-h-[calc(100svh-6.5rem)] overflow-hidden rounded-none border-x-0 border-t-0 bg-[#08090b]/98 md:flex md:h-[calc(100svh-6.5rem)] md:flex-col">
        <section className="px-3 py-3 md:flex-1 md:min-h-0 md:px-4">
          <div className="grid gap-3 md:h-full md:grid-cols-[minmax(0,1.14fr)_minmax(300px,0.86fr)] md:items-stretch xl:grid-cols-[minmax(0,1.2fr)_380px]">
            <SettingsPanel
              className="md:flex md:h-full md:min-h-0 md:flex-col"
              contentClassName="md:flex md:min-h-0 md:flex-1"
              description="Point the skin at the correct Streamline Bridge host, then keep the bridge authoritative for connection and device state."
              title="Bridge Routing"
            >
              <div className="grid gap-3 md:min-h-0 md:flex-1 md:content-start">
                <section className="rounded-[10px] border border-[#2a2112] bg-[#0f0c08] px-2.5 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[#d0a954]">
                        Active target
                      </p>
                      <p className="mt-1 font-mono text-[0.95rem] font-semibold tracking-[0.04em] text-foreground">
                        {gatewayUrl.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{isFetchingDevices ? "Refreshing gear" : "Bridge control"}</Badge>
                      <Badge variant="secondary">{devices.length} devices tracked</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-[0.76rem] leading-5 text-muted-foreground">
                    Scale and machine scan/connect policy stays in Streamline Bridge.
                    This skin only changes which bridge instance it talks to.
                  </p>
                </section>

                <section className="rounded-[10px] border border-border bg-[#090a0c] px-2.5 py-2.5">
                  <div className="grid gap-1">
                    <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Bridge URL
                    </p>
                    <p className="text-[0.76rem] leading-5 text-muted-foreground">
                      Use the REST origin exposed by the Streamline Bridge process.
                      Save will reconnect queries and the live snapshot stream.
                    </p>
                  </div>

                  <div className="mt-2.5 grid gap-2.5">
                    <label className="grid gap-1.5" htmlFor="gatewayUrl">
                      <span className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        REST origin
                      </span>
                      <Input
                        className="rounded-[10px] border-border bg-[#060709] font-mono"
                        id="gatewayUrl"
                        onChange={(event) => setDraftGatewayUrl(event.target.value)}
                        placeholder="http://localhost:8080"
                        value={draftGatewayUrl}
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="min-h-[42px] rounded-[10px] text-[0.72rem] uppercase tracking-[0.18em]"
                        onClick={() => void handleSave()}
                      >
                        Save and reconnect
                      </Button>
                      <Button
                        className="min-h-[42px] rounded-[10px] text-[0.72rem] uppercase tracking-[0.18em]"
                        onClick={() => setDraftGatewayUrl(window.location.origin)}
                        variant="secondary"
                      >
                        Use current origin
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="grid gap-2.5 xl:grid-cols-3">
                  <StatusTile
                    label="Socket target"
                    value={toWebSocketUrl(gatewayUrl).replace(/^wss?:\/\//, "")}
                  />
                  <StatusTile label="Workflow path" value="/api/v1/workflow" />
                  <StatusTile label="Devices path" value="/api/v1/devices" />
                </section>
              </div>
            </SettingsPanel>

            <div className="grid gap-3 md:h-full md:min-h-0 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
              <SettingsPanel
                className="md:flex md:min-h-0 md:flex-col"
                contentClassName="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1"
                description="The route map below mirrors the endpoints the skin currently uses for live machine state and workflow/device reads."
                title="Connection Preview"
              >
                <div className="grid gap-2">
                  {endpointRows.map((row) => (
                    <PreviewRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </div>
              </SettingsPanel>

              <SettingsPanel
                className="md:flex md:min-h-0 md:flex-col"
                contentClassName="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1"
                description="Device discovery is visible here for context. Pairing and preferred-device policy still belong to Streamline Bridge."
                title="Device Discovery"
              >
                <DeviceSummary
                  devices={devices}
                  errorMessage={devicesError?.message}
                  isFetching={isFetchingDevices}
                />
              </SettingsPanel>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsPanel({
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
        "rounded-[10px] border border-border bg-[#0b0c0f] px-2.5 py-2.5",
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

function StatusTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-[#090a0c] px-2.5 py-2.5">
      <p className="font-mono text-[0.56rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 break-all font-mono text-[0.74rem] font-semibold tracking-[0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-[#090a0c] px-2.5 py-2.5">
      <p className="font-mono text-[0.56rem] font-medium uppercase tracking-[0.16em] text-[#d0a954]">
        {label}
      </p>
      <p className="mt-1.5 break-all font-mono text-[0.74rem] font-semibold tracking-[0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}

function DeviceSummary({
  devices,
  errorMessage,
  isFetching,
}: {
  devices: DeviceSummary[];
  errorMessage?: string;
  isFetching: boolean;
}) {
  if (errorMessage) {
    return (
      <StateCallout tone="error">
        Device state is unavailable right now.
        <br />
        {errorMessage}
      </StateCallout>
    );
  }

  if (!devices.length) {
    return (
      <StateCallout tone="neutral">
        {isFetching
          ? "Checking the bridge for tracked devices."
          : "No tracked devices are currently reported by the bridge."}
      </StateCallout>
    );
  }

  return (
    <div className="grid gap-2">
      {devices.map((device) => (
        <div
          className="rounded-[10px] border border-border bg-[#090a0c] px-2.5 py-2.5"
          key={device.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-mono text-[0.9rem] font-semibold tracking-[0.02em] text-foreground">
                {device.name}
              </p>
              <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
                {device.type}
              </p>
            </div>
            <Badge variant={device.state === "connected" ? "default" : "secondary"}>
              {device.state}
            </Badge>
          </div>
          <div className="mt-2 grid gap-2 xl:grid-cols-[92px_minmax(0,1fr)]">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground">
              Device ID
            </p>
            <p className="break-all font-mono text-[0.72rem] font-semibold tracking-[0.04em] text-foreground">
              {device.id}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StateCallout({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "error" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border px-2.5 py-2.5 font-mono text-[0.7rem] leading-5 tracking-[0.04em]",
        tone === "error"
          ? "border-[#5f3438] bg-[#261316] text-[#ffb2b2]"
          : "border-border bg-[#090a0c] text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}
