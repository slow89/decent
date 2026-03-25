import type { MachineSnapshot } from "@/rest/types";
import type { TelemetrySample } from "@/lib/telemetry";

export type DashboardPresentationMode = "controls" | "shot";

function startCase(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatSecondaryNumber(
  value: number | null | undefined,
  suffix: string,
  fallback: string,
  digits = 1,
) {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return `${value.toFixed(digits)}${suffix}`;
}

export function metricCell(
  value: number | null | undefined,
  suffix: string,
  digits = 1,
) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(digits)}${suffix}`;
}

export function getStatusLabel({
  isOffline,
  liveConnection,
  machineSubstate,
  machineState,
}: {
  isOffline: boolean;
  liveConnection: "idle" | "connecting" | "live" | "error";
  machineSubstate?: string;
  machineState?: string;
}) {
  if (liveConnection === "connecting") {
    return "Connecting";
  }

  if (isOffline) {
    return "Offline";
  }

  const normalizedState = machineState?.toLowerCase();
  const normalizedSubstate = machineSubstate?.toLowerCase();

  if (normalizedState === "sleeping") {
    return "Sleeping";
  }

  if (normalizedSubstate === "ready") {
    return "Ready";
  }

  if (normalizedState === "idle") {
    return "Ready";
  }

  if (normalizedSubstate && machineSubstate && normalizedSubstate !== "idle") {
    return startCase(machineSubstate);
  }

  if (machineState) {
    return startCase(machineState);
  }

  return "Idle";
}

export function getDashboardDevEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("dev") === "true";
}

export function getDashboardPresentationMode({
  simulatedShotActive,
  snapshot,
  telemetry,
}: {
  simulatedShotActive?: boolean;
  snapshot?: MachineSnapshot | null;
  telemetry: TelemetrySample[];
}) {
  if (simulatedShotActive) {
    return "shot";
  }

  if (snapshot?.state.state === "espresso") {
    return "shot";
  }

  const latestTelemetry = telemetry[telemetry.length - 1];

  return latestTelemetry?.state === "espresso" ? "shot" : "controls";
}
