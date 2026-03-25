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
