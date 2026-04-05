import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initializeDeviceAutoConnectCoordinator } from "@/stores/device-auto-connect-coordinator";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { useDevicesStore } from "@/stores/devices-store";
import { useMachineStore } from "@/stores/machine-store";

describe("device auto-connect coordinator", () => {
  let cleanupCoordinator: (() => void) | undefined;

  afterEach(() => {
    cleanupCoordinator?.();
    cleanupCoordinator = undefined;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useBridgeConfigStore.setState({
      gatewayUrl: "http://bridge.local:8080",
    });
    useDevicesStore.setState({
      autoConnectRequested: false,
      connection: "idle",
      connectionStatus: {
        error: null,
        foundMachines: [],
        foundScales: [],
        pendingAmbiguity: null,
        phase: "idle",
      },
      connect: vi.fn(async () => undefined),
      connectDevice: vi.fn(async () => undefined),
      devices: [],
      disconnect: vi.fn(() => undefined),
      disconnectDevice: vi.fn(async () => undefined),
      error: null,
      requestAutoConnect: vi.fn(async () => undefined),
      reset: vi.fn(() => undefined),
      scan: vi.fn(async () => undefined),
      scanning: false,
      socket: null,
    });
    useMachineStore.setState({
      error: null,
      liveConnection: "idle",
      machineSocket: null,
      scaleConnection: "idle",
      scaleSnapshot: null,
      scaleSocket: null,
      telemetry: [],
      timeToReady: null,
      timeToReadySocket: null,
      waterConnection: "idle",
      waterLevels: null,
      waterSocket: null,
    });
  });

  it("requests a gateway-managed auto-connect scan when both streams are live without a connected scale", async () => {
    const requestAutoConnectSpy = vi
      .spyOn(useDevicesStore.getState(), "requestAutoConnect")
      .mockResolvedValue(undefined);

    cleanupCoordinator = initializeDeviceAutoConnectCoordinator();

    useDevicesStore.setState({
      connection: "live",
    });
    useMachineStore.setState({
      liveConnection: "live",
    });

    expect(requestAutoConnectSpy).toHaveBeenCalledTimes(1);
  });

  it("does not request auto-connect while the devices stream is scanning", async () => {
    const requestAutoConnectSpy = vi
      .spyOn(useDevicesStore.getState(), "requestAutoConnect")
      .mockResolvedValue(undefined);

    useDevicesStore.setState({
      connection: "live",
      connectionStatus: {
        error: null,
        foundMachines: [],
        foundScales: [],
        pendingAmbiguity: null,
        phase: "scanning",
      },
      scanning: true,
    });

    cleanupCoordinator = initializeDeviceAutoConnectCoordinator();

    useMachineStore.setState({
      liveConnection: "live",
    });

    expect(requestAutoConnectSpy).not.toHaveBeenCalled();
  });
});
