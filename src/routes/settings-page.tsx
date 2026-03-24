import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { useRouter } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toWebSocketUrl } from "@/rest/client";
import { queryClient } from "@/rest/query-client";
import { useDevicesQuery, bridgeQueryKeys } from "@/rest/queries";
import type {
  DeviceSummary,
  DisplayState,
} from "@/rest/types";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { useDisplayStore } from "@/stores/display-store";
import { usePresenceStore } from "@/stores/presence-store";
import { useThemeStore } from "@/stores/theme-store";

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
  const connection = useDisplayStore((state) => state.connection);
  const displayError = useDisplayStore((state) => state.error);
  const displayState = useDisplayStore((state) => state.displayState);
  const requestWakeLock = useDisplayStore((state) => state.requestWakeLock);
  const releaseWakeLock = useDisplayStore((state) => state.releaseWakeLock);
  const setBrightness = useDisplayStore((state) => state.setBrightness);
  const heartbeatError = usePresenceStore((state) => state.error);
  const timeoutSeconds = usePresenceStore((state) => state.timeoutSeconds);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [brightnessDraft, setBrightnessDraft] = useState(100);

  useEffect(() => {
    setBrightnessDraft(displayState?.requestedBrightness ?? 100);
  }, [displayState?.requestedBrightness]);

  const endpointRows = [
    { label: "REST origin", value: gatewayUrl },
    {
      label: "Machine snapshot",
      value: `${toWebSocketUrl(gatewayUrl)}/ws/v1/machine/snapshot`,
    },
    {
      label: "Display stream",
      value: `${toWebSocketUrl(gatewayUrl)}/ws/v1/display`,
    },
    { label: "Workflow API", value: `${gatewayUrl}/api/v1/workflow` },
    { label: "Devices API", value: `${gatewayUrl}/api/v1/devices` },
    { label: "Heartbeat API", value: `${gatewayUrl}/api/v1/machine/heartbeat` },
  ];

  async function handleSave() {
    setGatewayUrl(draftGatewayUrl);
    await queryClient.invalidateQueries({
      queryKey: bridgeQueryKeys.all,
    });
    await router.invalidate();
  }

  function handleBrightnessChange(event: ChangeEvent<HTMLInputElement>) {
    setBrightnessDraft(Number(event.target.value));
  }

  function commitBrightness(nextBrightness = brightnessDraft) {
    void setBrightness(nextBrightness);
  }

  function handleBrightnessKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") {
      commitBrightness();
    }
  }

  return (
    <div>
      <div className="panel min-h-[calc(100svh-var(--app-footer-height))] overflow-hidden rounded-none border-x-0 border-t-0 bg-shell md:flex md:h-[calc(100svh-var(--app-footer-height))] md:flex-col">
        <section className="px-2 py-2 md:flex-1 md:min-h-0 md:px-3 md:py-3">
          <div className="grid gap-2.5 md:h-full md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] md:grid-rows-[auto_minmax(0,1fr)] md:items-stretch xl:grid-cols-[minmax(0,1.18fr)_360px]">
            <SettingsPanel
              className="md:flex md:min-h-0 md:flex-col"
              contentClassName="md:flex md:min-h-0 md:flex-1"
              description="Point the skin at the correct Streamline Bridge host, then keep the bridge authoritative for connection and device state."
              title="Bridge Routing"
            >
              <div className="grid gap-2 md:min-h-0 md:flex-1 md:content-start">
                <section className="rounded-[10px] border border-border bg-panel-subtle px-2 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.18em] text-highlight">
                        Active target
                      </p>
                      <p className="mt-1 font-mono text-[0.88rem] font-semibold tracking-[0.04em] text-foreground">
                        {gatewayUrl.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{isFetchingDevices ? "Refreshing gear" : "Bridge control"}</Badge>
                      <Badge variant="secondary">{devices.length} devices tracked</Badge>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[0.72rem] leading-4 text-muted-foreground">
                    Scale and machine scan/connect policy stays in Streamline Bridge.
                    This skin only changes which bridge instance it talks to.
                  </p>
                </section>

                <section className="rounded-[10px] border border-border bg-panel-muted px-2 py-2">
                  <div className="grid gap-1">
                    <p className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Bridge URL
                    </p>
                    <p className="text-[0.72rem] leading-4 text-muted-foreground">
                      Use the REST origin exposed by the Streamline Bridge process.
                      Save will reconnect queries and the live snapshot stream.
                    </p>
                  </div>

                  <div className="mt-2 grid gap-2">
                    <label className="grid gap-1.5" htmlFor="gatewayUrl">
                      <span className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        REST origin
                      </span>
                      <Input
                        className="h-10 rounded-[10px] border-border bg-panel-strong font-mono text-[0.78rem]"
                        id="gatewayUrl"
                        onChange={(event) => setDraftGatewayUrl(event.target.value)}
                        placeholder="http://localhost:8080"
                        value={draftGatewayUrl}
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="min-h-[38px] rounded-[10px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
                        onClick={() => void handleSave()}
                        size="sm"
                      >
                        Save and reconnect
                      </Button>
                      <Button
                        className="min-h-[38px] rounded-[10px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
                        onClick={() => setDraftGatewayUrl(window.location.origin)}
                        size="sm"
                        variant="secondary"
                      >
                        Use current origin
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="grid gap-2 sm:grid-cols-3">
                  <StatusTile
                    label="Socket target"
                    value={toWebSocketUrl(gatewayUrl).replace(/^wss?:\/\//, "")}
                  />
                  <StatusTile label="Workflow path" value="/api/v1/workflow" />
                  <StatusTile label="Devices path" value="/api/v1/devices" />
                </section>
              </div>
            </SettingsPanel>

            <SettingsPanel
              className="md:flex md:min-h-0 md:flex-col"
              contentClassName="md:min-h-0 md:flex-1"
              description="Bridge presence and display APIs keep the tablet awake and reset the machine sleep timer while this skin is being used."
              title="Display & Sleep"
            >
                <div className="grid gap-2">
                <div className="grid gap-2 sm:grid-cols-3">
                  <PreviewRow label="Display status" value={connection} />
                  <PreviewRow
                    label="Wake-lock"
                    value={
                      displayState == null
                        ? "Unknown"
                        : displayState.wakeLockOverride
                          ? "Override active"
                          : displayState.wakeLockEnabled
                            ? "Auto-managed on"
                            : "Auto-managed off"
                    }
                  />
                  <PreviewRow label="Sleep timer" value={formatSleepTimeout(timeoutSeconds)} />
                </div>

                <div className="rounded-[10px] border border-border bg-panel-muted px-2 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.52rem] font-medium uppercase tracking-[0.16em] text-highlight">
                        Brightness
                      </p>
                      <p className="mt-0.5 text-[0.72rem] leading-4 text-muted-foreground">
                        {formatBrightnessSupport(displayState)}
                      </p>
                    </div>
                    <p className="font-mono text-[0.9rem] font-semibold tracking-[0.03em] text-foreground">
                      {formatBrightnessValue(brightnessDraft)}
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Dim
                    </span>
                    <input
                      className="h-2 w-full cursor-pointer accent-[#d0a954] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={displayState?.platformSupported.brightness === false}
                      max={100}
                      min={0}
                      onBlur={() => commitBrightness()}
                      onChange={handleBrightnessChange}
                      onKeyUp={handleBrightnessKeyUp}
                      onPointerUp={() => commitBrightness()}
                      step={1}
                      type="range"
                      value={brightnessDraft}
                    />
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Auto
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {displayState ? (
                      <p className="self-center font-mono text-[0.62rem] tracking-[0.03em] text-muted-foreground">
                        Applied: {formatBrightnessValue(displayState.brightness)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <section className="rounded-[10px] border border-border bg-panel-muted px-2 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.52rem] font-medium uppercase tracking-[0.16em] text-highlight">
                        Theme
                      </p>
                      <p className="mt-0.5 text-[0.72rem] leading-4 text-muted-foreground">
                        Switch the skin between dark and light surfaces.
                      </p>
                    </div>
                    <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-foreground">
                      {theme}
                    </p>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <ThemeOptionButton
                      isActive={theme === "dark"}
                      label="Dark"
                      onClick={() => setTheme("dark")}
                    />
                    <ThemeOptionButton
                      isActive={theme === "light"}
                      label="Light"
                      onClick={() => setTheme("light")}
                    />
                  </div>
                </section>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    disabled={displayState?.platformSupported.wakeLock === false}
                    onClick={() =>
                      void (displayState?.wakeLockOverride ? releaseWakeLock() : requestWakeLock())
                    }
                    size="sm"
                  >
                    {displayState?.wakeLockOverride ? "Release wake-lock" : "Keep screen on"}
                  </Button>
                </div>

                {displayError ? (
                  <p className="font-mono text-[0.7rem] text-destructive">{displayError}</p>
                ) : null}
                {heartbeatError ? (
                  <p className="font-mono text-[0.7rem] text-destructive">{heartbeatError}</p>
                ) : null}
              </div>
            </SettingsPanel>

            <div className="grid gap-2.5 md:col-span-2 md:h-full md:min-h-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <SettingsPanel
                className="md:flex md:min-h-0 md:flex-col"
                contentClassName="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1"
                description="The route map below mirrors the endpoints the skin currently uses for live machine state and workflow/device reads."
                title="Connection Preview"
              >
                <div className="grid gap-1.5 sm:grid-cols-2">
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
        "rounded-[10px] border border-border bg-panel px-2 py-2",
        className,
      )}
    >
      <p className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-0.5 text-[0.72rem] leading-4 text-muted-foreground">{description}</p>
      <div className={cn("mt-2", contentClassName)}>{children}</div>
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
    <div className="rounded-[10px] border border-border bg-panel-muted px-2 py-1.5">
      <p className="font-mono text-[0.52rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-all font-mono text-[0.7rem] font-semibold tracking-[0.03em] text-foreground">
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
    <div className="rounded-[10px] border border-border bg-panel-muted px-2 py-1.5">
      <p className="font-mono text-[0.52rem] font-medium uppercase tracking-[0.16em] text-highlight">
        {label}
      </p>
      <p className="mt-1 break-all font-mono text-[0.7rem] font-semibold tracking-[0.03em] text-foreground">
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
          className="rounded-[10px] border border-border bg-panel-muted px-2 py-1.5"
          key={device.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-mono text-[0.82rem] font-semibold tracking-[0.02em] text-foreground">
                {device.name}
              </p>
              <p className="mt-0.5 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-muted-foreground">
                {device.type}
              </p>
            </div>
            <Badge variant={device.state === "connected" ? "default" : "secondary"}>
              {device.state}
            </Badge>
          </div>
          <div className="mt-1.5 grid gap-1.5 xl:grid-cols-[74px_minmax(0,1fr)]">
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.16em] text-muted-foreground">
              Device ID
            </p>
            <p className="break-all font-mono text-[0.68rem] font-semibold tracking-[0.03em] text-foreground">
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
        "rounded-[10px] border px-2 py-1.5 font-mono text-[0.68rem] leading-4 tracking-[0.04em]",
        tone === "error"
          ? "border-status-error-border bg-status-error-surface text-status-error-foreground"
          : "border-border bg-panel-muted text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}

function ThemeOptionButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      aria-pressed={isActive}
      className="min-h-[38px] rounded-[10px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
      onClick={onClick}
      size="sm"
      variant={isActive ? "default" : "secondary"}
    >
      {label}
    </Button>
  );
}

function formatBrightness(displayState: DisplayState | null) {
  if (!displayState) {
    return "Unknown";
  }

  const base =
    displayState.requestedBrightness === 100
      ? "Auto"
      : `${displayState.brightness}%`;

  if (
    displayState.lowBatteryBrightnessActive &&
    displayState.requestedBrightness !== displayState.brightness
  ) {
    return `${base} (capped from ${displayState.requestedBrightness}%)`;
  }

  if (displayState.requestedBrightness === 100) {
    return "Auto (OS managed)";
  }

  return base;
}

function formatBrightnessValue(brightness: number) {
  if (brightness === 100) {
    return "Auto";
  }

  return `${brightness}%`;
}

function formatBrightnessSupport(displayState: DisplayState | null) {
  if (!displayState) {
    return "Waiting for the bridge to report display state.";
  }

  if (!displayState.platformSupported.brightness) {
    return "Brightness control is not available on this platform.";
  }

  if (displayState.lowBatteryBrightnessActive) {
    return "Low battery mode may cap the applied brightness.";
  }

  return "Drag the slider to set screen brightness. Auto uses the OS setting.";
}

function formatSleepTimeout(timeoutSeconds: number | null) {
  if (timeoutSeconds == null) {
    return "Unknown";
  }

  if (timeoutSeconds < 0) {
    return "Disabled";
  }

  return `${timeoutSeconds}s`;
}
