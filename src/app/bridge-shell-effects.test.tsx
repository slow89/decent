import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { useDevicesStore } from "@/stores/devices-store";
import { useDisplayStore } from "@/stores/display-store";
import { useMachineStore } from "@/stores/machine-store";
import { usePresenceStore } from "@/stores/presence-store";

import { BridgeShellEffects } from "./bridge-shell-effects";

describe("BridgeShellEffects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBridgeConfigStore.setState({
      gatewayUrl: "http://bridge.local:8080",
    });
    useDevicesStore.setState({
      autoConnectRequested: false,
      connection: "live",
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
      reset: vi.fn(() => undefined),
      scan: vi.fn(async () => undefined),
      scanning: false,
      socket: null,
      requestAutoConnect: vi.fn(async () => undefined),
    });
    useMachineStore.setState({
      error: null,
      liveConnection: "live",
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

  it("connects the live machine, devices, and display streams on mount", async () => {
    const connectLiveSpy = vi
      .spyOn(useMachineStore.getState(), "connectLive")
      .mockResolvedValue(undefined);
    const connectDevicesSpy = vi
      .spyOn(useDevicesStore.getState(), "connect")
      .mockResolvedValue(undefined);
    const connectDisplaySpy = vi
      .spyOn(useDisplayStore.getState(), "connect")
      .mockResolvedValue(undefined);

    vi.spyOn(useMachineStore.getState(), "disconnectLive").mockImplementation(() => undefined);
    vi.spyOn(useDevicesStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(useDisplayStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(usePresenceStore.getState(), "signalPresence").mockResolvedValue(undefined);

    render(<BridgeShellEffects />);

    await waitFor(() => {
      expect(connectLiveSpy).toHaveBeenCalledTimes(1);
      expect(connectDevicesSpy).toHaveBeenCalledTimes(1);
      expect(connectDisplaySpy).toHaveBeenCalledTimes(1);
    });
  });

  it("reconnects the scale feed when the devices stream reports a connected scale", async () => {
    const connectScaleSpy = vi
      .spyOn(useMachineStore.getState(), "connectScale")
      .mockResolvedValue(undefined);

    vi.spyOn(useMachineStore.getState(), "connectLive").mockResolvedValue(undefined);
    vi.spyOn(useMachineStore.getState(), "disconnectLive").mockImplementation(() => undefined);
    vi.spyOn(useDevicesStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDevicesStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(useDisplayStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDisplayStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(usePresenceStore.getState(), "signalPresence").mockResolvedValue(undefined);

    useDevicesStore.setState({
      devices: [
        {
          id: "scale-1",
          name: "Acaia Lunar",
          state: "connected",
          type: "scale",
        },
      ],
    });

    render(<BridgeShellEffects />);

    await waitFor(() => {
      expect(connectScaleSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("disconnects the scale feed when the devices stream no longer reports a scale", async () => {
    vi.spyOn(useMachineStore.getState(), "connectLive").mockResolvedValue(undefined);
    vi.spyOn(useMachineStore.getState(), "disconnectLive").mockImplementation(() => undefined);
    vi.spyOn(useDevicesStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDevicesStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(useDisplayStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDisplayStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(usePresenceStore.getState(), "signalPresence").mockResolvedValue(undefined);
    const disconnectScaleSpy = vi
      .spyOn(useMachineStore.getState(), "disconnectScale")
      .mockImplementation(() => undefined);

    useDevicesStore.setState({
      devices: [
        {
          id: "scale-1",
          name: "Acaia Lunar",
          state: "connected",
          type: "scale",
        },
      ],
    });

    const { rerender } = render(<BridgeShellEffects />);

    useDevicesStore.setState({
      devices: [],
    });
    rerender(<BridgeShellEffects />);

    await waitFor(() => {
      expect(disconnectScaleSpy).toHaveBeenCalled();
    });
  });
});
