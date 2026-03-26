import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { useRouter } from "@tanstack/react-router";

import { VisualizerSettingsPanel } from "@/components/settings/visualizer-settings-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toWebSocketUrl } from "@/rest/client";
import { queryClient } from "@/rest/query-client";
import {
  bridgeQueryKeys,
  useConnectDeviceMutation,
  useDevicesQuery,
  useDisconnectDeviceMutation,
  usePresenceSettingsQuery,
  useScanDevicesMutation,
  useUpdatePresenceSettingsMutation,
} from "@/rest/queries";
import type {
  DeviceSummary,
  DisplayState,
  PresenceSettings,
} from "@/rest/types";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { useDisplayStore } from "@/stores/display-store";
import { usePresenceStore } from "@/stores/presence-store";
import { useThemeStore } from "@/stores/theme-store";

export function SettingsPage() {
  const deviceRefreshMs = 3_000;
  const sleepTimeoutOptions = [0, 15, 30, 45, 60] as const;
  const router = useRouter();
  const gatewayUrl = useBridgeConfigStore((state) => state.gatewayUrl);
  const setGatewayUrl = useBridgeConfigStore((state) => state.setGatewayUrl);
  const [draftGatewayUrl, setDraftGatewayUrl] = useState(gatewayUrl);
  const {
    data: devices = [],
    error: devicesError,
    isFetching: isFetchingDevices,
  } = useDevicesQuery({
    refetchInterval: deviceRefreshMs,
  });
  const scanDevicesMutation = useScanDevicesMutation();
  const connectDeviceMutation = useConnectDeviceMutation();
  const disconnectDeviceMutation = useDisconnectDeviceMutation();
  const {
    data: presenceSettings,
    error: presenceSettingsError,
    isPending: isPresenceSettingsPending,
  } = usePresenceSettingsQuery();
  const updatePresenceSettingsMutation = useUpdatePresenceSettingsMutation();
  const displayError = useDisplayStore((state) => state.error);
  const displayState = useDisplayStore((state) => state.displayState);
  const requestWakeLock = useDisplayStore((state) => state.requestWakeLock);
  const releaseWakeLock = useDisplayStore((state) => state.releaseWakeLock);
  const setBrightness = useDisplayStore((state) => state.setBrightness);
  const heartbeatError = usePresenceStore((state) => state.error);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const isFullscreen = useIsFullscreen();
  const [brightnessDraft, setBrightnessDraft] = useState(100);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);

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
  const connectedDevices = devices.filter((device) => device.state === "connected");
  const disconnectedDevices = devices.filter((device) => device.state !== "connected");
  const canToggleFullscreen = hasFullscreenApi();
  const wakeLockLabel = getWakeLockLabel(displayState);
  const sleepTimerLabel = formatConfiguredSleepTimeout(presenceSettings);

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

  async function handleFullscreenToggle() {
    if (!hasFullscreenApi()) {
      setFullscreenError("Full screen is not available on this device.");
      return;
    }

    setFullscreenError(null);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch (error) {
      setFullscreenError(
        error instanceof Error ? error.message : "Unable to change full screen mode.",
      );
    }
  }

  async function handleSleepTimeoutChange(minutes: number) {
    await updatePresenceSettingsMutation.mutateAsync({
      sleepTimeoutMinutes: minutes,
      userPresenceEnabled: minutes > 0,
    });
  }

  return (
    <div className="panel min-h-[calc(100vh-var(--app-footer-height))] overflow-y-auto rounded-none border-x-0 border-t-0 bg-shell">
      <section className="mx-auto grid max-w-[1520px] gap-3 px-2 py-2 md:px-3 md:py-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
          <SettingsSection
            description="This area stays up to date automatically. Technical bridge details are pushed below."
            title="Device Pairing"
          >
            <div className="grid gap-3">
              <div className="grid gap-2 rounded-[18px] border border-border bg-panel-subtle px-3 py-3 shadow-panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-[30rem]">
                    <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-highlight">
                      Recommended path
                    </p>
                    <h2 className="mt-1 text-balance font-display text-[1.38rem] leading-none text-foreground md:text-[1.7rem]">
                      Find devices, then pair what shows up.
                    </h2>
                    <p className="mt-2 max-w-[28rem] text-[0.78rem] leading-5 text-muted-foreground">
                      Most people only need one action: look for nearby devices, then connect the
                      scale or machine that appears below.
                    </p>
                  </div>
                  <div className="grid w-full gap-2 sm:grid-cols-3 xl:w-auto xl:min-w-[320px]">
                    <MetricTile label="Tracked" value={`${devices.length}`} />
                    <MetricTile label="Connected" value={`${connectedDevices.length}`} />
                    <MetricTile label="Needs pairing" value={`${disconnectedDevices.length}`} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="min-h-[42px] rounded-[12px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
                  disabled={scanDevicesMutation.isPending}
                  onClick={() => void scanDevicesMutation.mutateAsync(undefined)}
                  size="sm"
                >
                  {scanDevicesMutation.isPending ? "Looking..." : "Find and pair"}
                </Button>
                <Button
                  className="min-h-[42px] rounded-[12px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
                  disabled={scanDevicesMutation.isPending}
                  onClick={() => void scanDevicesMutation.mutateAsync({ connect: false })}
                  size="sm"
                  variant="outline"
                >
                  Find only
                </Button>
              </div>

              <DeviceSummary
                connectPendingDeviceId={
                  connectDeviceMutation.isPending ? connectDeviceMutation.variables : null
                }
                disconnectPendingDeviceId={
                  disconnectDeviceMutation.isPending ? disconnectDeviceMutation.variables : null
                }
                devices={devices}
                errorMessage={devicesError?.message}
                isFetching={isFetchingDevices}
                onConnectDevice={(deviceId) => void connectDeviceMutation.mutateAsync(deviceId)}
                onDisconnectDevice={(deviceId) =>
                  void disconnectDeviceMutation.mutateAsync(deviceId)
                }
                scanErrorMessage={scanDevicesMutation.error?.message}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            className="xl:sticky xl:top-3"
            description="Keep the tablet readable, awake, and easy to recover during service."
            title="Display & Sleep"
          >
            <div className="grid gap-3">
              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-2">
                <MetricTile label="Wake-lock" value={wakeLockLabel} />
                <MetricTile label="Sleep timer" value={sleepTimerLabel} />
                <MetricTile label="Theme" value={theme} />
              </div>

              <ControlBlock
                description={formatBrightnessSupport(displayState)}
                label="Brightness"
                value={formatBrightnessValue(brightnessDraft)}
              >
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

                <p className="mt-2 font-mono text-[0.62rem] tracking-[0.03em] text-muted-foreground">
                  Applied: {formatBrightness(displayState)}
                </p>
              </ControlBlock>

              <ControlBlock
                description="Choose when the machine should auto-sleep after no activity."
                label="Sleep timer"
                value={sleepTimerLabel}
              >
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {sleepTimeoutOptions.map((minutes) => (
                    <SleepTimeoutOptionButton
                      disabled={isPresenceSettingsPending || updatePresenceSettingsMutation.isPending}
                      isActive={getSleepTimeoutMinutes(presenceSettings) === minutes}
                      key={minutes}
                      label={formatSleepTimeoutOption(minutes)}
                      onClick={() => void handleSleepTimeoutChange(minutes)}
                    />
                  ))}
                </div>
              </ControlBlock>

              <ControlBlock
                description="Pick the surface that is easiest to read in the room you are in."
                label="Theme"
                value={theme}
              >
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
              </ControlBlock>

              <VisualizerSettingsPanel />

              <ControlBlock
                description="Use these if the tablet should stay visible all shift or fill the whole screen."
                label="Screen tools"
                value={isFullscreen ? "Full screen on" : "Normal view"}
              >
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Button
                    disabled={displayState?.platformSupported.wakeLock === false}
                    onClick={() =>
                      void (displayState?.wakeLockOverride ? releaseWakeLock() : requestWakeLock())
                    }
                    size="sm"
                  >
                    {displayState?.wakeLockOverride ? "Let screen sleep" : "Keep screen on"}
                  </Button>
                  <Button
                    disabled={!canToggleFullscreen}
                    onClick={() => void handleFullscreenToggle()}
                    size="sm"
                    variant="secondary"
                  >
                    {isFullscreen ? "Exit full screen" : "Enter full screen"}
                  </Button>
                </div>
              </ControlBlock>

              {displayError ? <StateCallout tone="error">{displayError}</StateCallout> : null}
              {presenceSettingsError ? (
                <StateCallout tone="error">{presenceSettingsError.message}</StateCallout>
              ) : null}
              {heartbeatError ? <StateCallout tone="error">{heartbeatError}</StateCallout> : null}
              {fullscreenError ? <StateCallout tone="error">{fullscreenError}</StateCallout> : null}
            </div>
          </SettingsSection>
        </div>

        <details className="rounded-[18px] border border-border bg-panel px-3 py-3 shadow-panel">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-highlight">
                Advanced Bridge Settings
              </p>
              <p className="mt-1 max-w-[40rem] text-[0.78rem] leading-5 text-muted-foreground">
                Only touch these when the tablet is pointed at the wrong bridge or you are debugging a connection.
              </p>
            </div>
            <span className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
              Open
            </span>
          </summary>

          <div className="mt-3 grid gap-3">
            <div className="grid gap-3 rounded-[16px] border border-border bg-panel-muted px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="grid gap-1.5" htmlFor="gatewayUrl">
                <span className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  REST origin
                </span>
                <Input
                  className="h-11 rounded-[12px] border-border bg-panel-strong font-mono text-[0.8rem]"
                  id="gatewayUrl"
                  onChange={(event) => setDraftGatewayUrl(event.target.value)}
                  placeholder="http://localhost:8080"
                  value={draftGatewayUrl}
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  className="min-h-[42px] rounded-[12px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
                  onClick={() => void handleSave()}
                  size="sm"
                >
                  Save and reconnect
                </Button>
                <Button
                  className="min-h-[42px] rounded-[12px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
                  onClick={() => setDraftGatewayUrl(window.location.origin)}
                  size="sm"
                  variant="secondary"
                >
                  Use current origin
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Active target
                  </p>
                  <p className="mt-1 font-mono text-[0.92rem] font-semibold tracking-[0.03em] text-foreground">
                    {gatewayUrl.replace(/^https?:\/\//, "")}
                  </p>
                </div>
                <Badge variant="secondary">{devices.length} devices tracked</Badge>
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                {endpointRows.map((row) => (
                  <EndpointRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}

function SettingsSection({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[18px] border border-border bg-panel px-3 py-3 shadow-panel",
        className,
      )}
    >
      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-highlight">
        {title}
      </p>
      <p className="mt-1 max-w-[40rem] text-[0.78rem] leading-5 text-muted-foreground">
        {description}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ControlBlock({
  children,
  description,
  label,
  value,
}: {
  children: ReactNode;
  description: string;
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-[16px] border border-border bg-panel-muted px-3 py-3 transition-colors hover:border-highlight/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.16em] text-highlight">
            {label}
          </p>
          <p className="mt-1 max-w-[24rem] text-[0.74rem] leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <p className="shrink-0 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-foreground">
          {value}
        </p>
      </div>
      {children}
    </section>
  );
}

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-panel-muted px-3 py-2.5 transition-colors hover:border-highlight/30">
      <p className="font-mono text-[0.52rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words font-mono text-[0.82rem] font-semibold tracking-[0.03em] text-foreground">
        {value}
      </p>
    </div>
  );
}

function EndpointRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-panel-muted px-3 py-2">
      <p className="font-mono text-[0.52rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-all font-mono text-[0.7rem] font-semibold tracking-[0.03em] text-foreground">
        {value}
      </p>
    </div>
  );
}

function DeviceSummary({
  connectPendingDeviceId,
  disconnectPendingDeviceId,
  devices,
  errorMessage,
  isFetching,
  onConnectDevice,
  onDisconnectDevice,
  scanErrorMessage,
}: {
  connectPendingDeviceId: string | null;
  disconnectPendingDeviceId: string | null;
  devices: DeviceSummary[];
  errorMessage?: string;
  isFetching: boolean;
  onConnectDevice: (deviceId: string) => void;
  onDisconnectDevice: (deviceId: string) => void;
  scanErrorMessage?: string;
}) {
  const scaleDevices = devices.filter((device) => device.type === "scale");
  const otherDevices = devices.filter((device) => device.type !== "scale");
  const connectedScales = scaleDevices.filter((device) => device.state === "connected");
  const disconnectedScales = scaleDevices.filter((device) => device.state !== "connected");

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
      <div className="grid gap-2">
        <StateCallout tone="neutral">
          {isFetching
            ? "Checking the bridge for tracked devices."
            : "No tracked devices are currently reported by the bridge."}
        </StateCallout>
        {!isFetching ? (
          <StateCallout tone="neutral">Use Find only, then pair your scale here.</StateCallout>
        ) : null}
        {scanErrorMessage ? <StateCallout tone="error">{scanErrorMessage}</StateCallout> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <DeviceGroup
        connectPendingDeviceId={connectPendingDeviceId}
        description={
          connectedScales.length
            ? `Scale live on ${connectedScales[0]?.name}. Disconnect here if you need to switch devices.`
            : disconnectedScales.length
              ? "Discovered scales can be paired directly from this page."
              : "No scales discovered yet. Use Find only, then pair your scale here."
        }
        devices={scaleDevices}
        disconnectPendingDeviceId={disconnectPendingDeviceId}
        emptyMessage="No scales discovered yet. Use Find only, then pair your scale here."
        onConnectDevice={onConnectDevice}
        onDisconnectDevice={onDisconnectDevice}
        title="Scale Pairing"
      />

      {otherDevices.length ? (
        <DeviceGroup
          connectPendingDeviceId={connectPendingDeviceId}
          description="Machines and other bridge-managed devices remain available below."
          devices={otherDevices}
          disconnectPendingDeviceId={disconnectPendingDeviceId}
          onConnectDevice={onConnectDevice}
          onDisconnectDevice={onDisconnectDevice}
          title="Other Devices"
        />
      ) : null}

      {scanErrorMessage ? <StateCallout tone="error">{scanErrorMessage}</StateCallout> : null}
    </div>
  );
}

function DeviceGroup({
  connectPendingDeviceId,
  description,
  devices,
  disconnectPendingDeviceId,
  emptyMessage,
  onConnectDevice,
  onDisconnectDevice,
  title,
}: {
  connectPendingDeviceId: string | null;
  description: string;
  devices: DeviceSummary[];
  disconnectPendingDeviceId: string | null;
  emptyMessage?: string;
  onConnectDevice: (deviceId: string) => void;
  onDisconnectDevice: (deviceId: string) => void;
  title: string;
}) {
  const connectedDevices = devices.filter((device) => device.state === "connected");
  const disconnectedDevices = devices.filter((device) => device.state !== "connected");

  if (!devices.length) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <div className="grid gap-1.5">
        <p className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
        <StateCallout tone="neutral">{emptyMessage}</StateCallout>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="grid gap-1">
        <p className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
        <p className="text-[0.74rem] leading-5 text-muted-foreground">{description}</p>
      </div>

      {connectedDevices.length ? (
        <DeviceList
          actionVariant="secondary"
          connectPendingDeviceId={connectPendingDeviceId}
          devices={connectedDevices}
          disconnectPendingDeviceId={disconnectPendingDeviceId}
          onConnectDevice={onConnectDevice}
          onDisconnectDevice={onDisconnectDevice}
          title="Connected"
        />
      ) : null}

      {disconnectedDevices.length ? (
        <DeviceList
          actionVariant="default"
          connectPendingDeviceId={connectPendingDeviceId}
          devices={disconnectedDevices}
          disconnectPendingDeviceId={disconnectPendingDeviceId}
          onConnectDevice={onConnectDevice}
          onDisconnectDevice={onDisconnectDevice}
          title="Available"
        />
      ) : null}
    </div>
  );
}

function DeviceList({
  actionVariant,
  connectPendingDeviceId,
  devices,
  disconnectPendingDeviceId,
  onConnectDevice,
  onDisconnectDevice,
  title,
}: {
  actionVariant: "default" | "secondary";
  connectPendingDeviceId: string | null;
  devices: DeviceSummary[];
  disconnectPendingDeviceId: string | null;
  onConnectDevice: (deviceId: string) => void;
  onDisconnectDevice: (deviceId: string) => void;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-panel-muted">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="font-mono text-[0.52rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </p>
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {devices.length}
        </p>
      </div>

      <div className="divide-y divide-border">
        {devices.map((device) => (
          <DeviceRow
            actionLabel={
              connectPendingDeviceId === device.id || disconnectPendingDeviceId === device.id
                ? getPendingDeviceActionLabel(device)
                : getDeviceActionLabel(device)
            }
            actionVariant={actionVariant}
            device={device}
            disabled={Boolean(connectPendingDeviceId || disconnectPendingDeviceId)}
            key={device.id}
            onAction={device.state === "connected" ? onDisconnectDevice : onConnectDevice}
          />
        ))}
      </div>
    </div>
  );
}

function DeviceRow({
  actionLabel,
  actionVariant,
  device,
  disabled,
  onAction,
}: {
  actionLabel: string;
  actionVariant: "default" | "secondary";
  device: DeviceSummary;
  disabled: boolean;
  onAction: (deviceId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-mono text-[0.84rem] font-semibold tracking-[0.02em] text-foreground">
            {device.name}
          </p>
          <Badge variant={device.state === "connected" ? "default" : "secondary"}>
            {device.state}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-mono text-[0.54rem] uppercase tracking-[0.18em] text-muted-foreground">
            {device.type}
          </p>
          <p className="break-all font-mono text-[0.64rem] font-semibold tracking-[0.03em] text-muted-foreground">
            {device.id}
          </p>
        </div>
      </div>

      <Button
        className="min-h-[38px] rounded-[12px] px-3 text-[0.62rem] uppercase tracking-[0.14em] sm:shrink-0"
        disabled={disabled}
        onClick={() => onAction(device.id)}
        size="sm"
        variant={actionVariant}
      >
        {actionLabel}
      </Button>
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
        "rounded-[14px] border px-3 py-2 font-mono text-[0.68rem] leading-5 tracking-[0.03em]",
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
      className="min-h-[40px] rounded-[12px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
      onClick={onClick}
      size="sm"
      variant={isActive ? "default" : "secondary"}
    >
      {label}
    </Button>
  );
}

function SleepTimeoutOptionButton({
  disabled,
  isActive,
  label,
  onClick,
}: {
  disabled?: boolean;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      aria-pressed={isActive}
      className="min-h-[40px] rounded-[12px] px-3 text-[0.62rem] uppercase tracking-[0.16em]"
      disabled={disabled}
      onClick={onClick}
      size="sm"
      variant={isActive ? "default" : "secondary"}
    >
      {label}
    </Button>
  );
}

function getDeviceActionLabel(device: DeviceSummary) {
  if (device.state === "connected") {
    return `Disconnect ${device.type}`;
  }

  if (device.type === "scale") {
    return "Pair scale";
  }

  return `Connect ${device.type}`;
}

function getPendingDeviceActionLabel(device: DeviceSummary) {
  if (device.state === "connected") {
    return `Disconnecting ${device.type}...`;
  }

  if (device.type === "scale") {
    return "Pairing scale...";
  }

  return `Connecting ${device.type}...`;
}

function getWakeLockLabel(displayState: DisplayState | null) {
  if (displayState == null) {
    return "Unknown";
  }

  if (displayState.wakeLockOverride) {
    return "Override active";
  }

  return displayState.wakeLockEnabled ? "Auto-managed on" : "Auto-managed off";
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

function getSleepTimeoutMinutes(presenceSettings: PresenceSettings | undefined) {
  if (!presenceSettings) {
    return 30;
  }

  if (!presenceSettings.userPresenceEnabled || presenceSettings.sleepTimeoutMinutes <= 0) {
    return 0;
  }

  return presenceSettings.sleepTimeoutMinutes;
}

function formatConfiguredSleepTimeout(presenceSettings: PresenceSettings | undefined) {
  if (!presenceSettings) {
    return "Loading";
  }

  const minutes = getSleepTimeoutMinutes(presenceSettings);

  if (minutes <= 0) {
    return "Disabled";
  }

  return `${minutes} min`;
}

function formatSleepTimeoutOption(minutes: number) {
  if (minutes <= 0) {
    return "Off";
  }

  return `${minutes}m`;
}

function hasFullscreenApi() {
  if (typeof document === "undefined") {
    return false;
  }

  return typeof document.documentElement.requestFullscreen === "function";
}

function subscribeToFullscreen(callback: () => void) {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  document.addEventListener("fullscreenchange", callback);
  return () => {
    document.removeEventListener("fullscreenchange", callback);
  };
}

function getFullscreenSnapshot() {
  if (typeof document === "undefined") {
    return false;
  }

  return Boolean(document.fullscreenElement);
}

function useIsFullscreen() {
  return useSyncExternalStore(subscribeToFullscreen, getFullscreenSnapshot, () => false);
}
