import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { useDisplayStore } from "@/stores/display-store";
import { useMachineStore } from "@/stores/machine-store";
import { usePresenceStore } from "@/stores/presence-store";

import { BridgeShellEffects } from "./bridge-shell-effects";

const queryMocks = vi.hoisted(() => ({
  useBridgeSettingsQuery: vi.fn(),
  useDevicesQuery: vi.fn(),
}));

vi.mock("@/rest/queries", async () => {
  const actual = await vi.importActual<typeof import("@/rest/queries")>("@/rest/queries");

  return {
    ...actual,
    useBridgeSettingsQuery: queryMocks.useBridgeSettingsQuery,
    useDevicesQuery: queryMocks.useDevicesQuery,
  };
});

describe("BridgeShellEffects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBridgeConfigStore.setState({
      gatewayUrl: "http://bridge.local:8080",
    });
    useMachineStore.setState({
      error: null,
      lastScaleReconnectAttemptAt: null,
      liveConnection: "live",
      machineSocket: null,
      scaleConnection: "idle",
      scaleSnapshot: null,
      scaleSocket: null,
      telemetry: [],
      waterConnection: "idle",
      waterLevels: null,
      waterSocket: null,
    });
    queryMocks.useBridgeSettingsQuery.mockReturnValue({
      data: {
        preferredScaleId: "scale-1",
      },
      dataUpdatedAt: 1,
      error: null,
    });
  });

  it("owns device polling and reconnects the scale feed when a paired scale exists", async () => {
    const connectLiveSpy = vi
      .spyOn(useMachineStore.getState(), "connectLive")
      .mockResolvedValue(undefined);
    const connectScaleSpy = vi
      .spyOn(useMachineStore.getState(), "connectScale")
      .mockResolvedValue(undefined);
    vi.spyOn(useMachineStore.getState(), "disconnectLive").mockImplementation(() => undefined);
    vi.spyOn(useDisplayStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDisplayStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(usePresenceStore.getState(), "signalPresence").mockResolvedValue(undefined);

    queryMocks.useDevicesQuery.mockReturnValue({
      data: [
        {
          id: "scale-1",
          name: "Acaia Lunar",
          state: "connected",
          type: "scale",
        },
      ],
      dataUpdatedAt: 1,
      error: null,
    });

    render(<BridgeShellEffects />);

    expect(queryMocks.useDevicesQuery).toHaveBeenCalledWith({
      refetchInterval: 2_000,
    });

    await waitFor(() => {
      expect(connectLiveSpy).toHaveBeenCalledTimes(1);
      expect(connectScaleSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("disconnects the scale feed when the bridge no longer reports a paired scale", async () => {
    let devices = [
      {
        id: "scale-1",
        name: "Acaia Lunar",
        state: "connected",
        type: "scale",
      },
    ];
    let devicesUpdatedAt = 1;

    vi.spyOn(useMachineStore.getState(), "connectLive").mockResolvedValue(undefined);
    vi.spyOn(useMachineStore.getState(), "disconnectLive").mockImplementation(() => undefined);
    vi.spyOn(useDisplayStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDisplayStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(usePresenceStore.getState(), "signalPresence").mockResolvedValue(undefined);
    const disconnectScaleSpy = vi
      .spyOn(useMachineStore.getState(), "disconnectScale")
      .mockImplementation(() => undefined);

    queryMocks.useDevicesQuery.mockImplementation(() => ({
      data: devices,
      dataUpdatedAt: devicesUpdatedAt,
      error: null,
    }));

    const { rerender } = render(<BridgeShellEffects />);

    devices = [];
    devicesUpdatedAt = 2;
    rerender(<BridgeShellEffects />);

    await waitFor(() => {
      expect(disconnectScaleSpy).toHaveBeenCalled();
    });
  });

  it("keeps scanning for the preferred scale when it is not currently connected", async () => {
    let devicesUpdatedAt = 1;

    vi.spyOn(useMachineStore.getState(), "connectLive").mockResolvedValue(undefined);
    vi.spyOn(useMachineStore.getState(), "disconnectLive").mockImplementation(() => undefined);
    vi.spyOn(useDisplayStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDisplayStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(usePresenceStore.getState(), "signalPresence").mockResolvedValue(undefined);
    const reconnectPreferredScaleSpy = vi
      .spyOn(useMachineStore.getState(), "reconnectPreferredScale")
      .mockResolvedValue(undefined);

    queryMocks.useDevicesQuery.mockImplementation(() => ({
      data: [
        {
          id: "scale-1",
          name: "Acaia Lunar",
          state: "disconnected",
          type: "scale",
        },
      ],
      dataUpdatedAt: devicesUpdatedAt,
      error: null,
    }));

    const { rerender } = render(<BridgeShellEffects />);

    await waitFor(() => {
      expect(reconnectPreferredScaleSpy).toHaveBeenCalledTimes(1);
    });

    devicesUpdatedAt = 2;
    rerender(<BridgeShellEffects />);

    await waitFor(() => {
      expect(reconnectPreferredScaleSpy).toHaveBeenCalledTimes(2);
    });

    devicesUpdatedAt = 3;
    rerender(<BridgeShellEffects />);

    await waitFor(() => {
      expect(reconnectPreferredScaleSpy).toHaveBeenCalledTimes(3);
    });
  });

  it("stops retrying once the preferred scale reports as connected", async () => {
    let devices = [
      {
        id: "scale-1",
        name: "Acaia Lunar",
        state: "disconnected",
        type: "scale",
      },
    ];
    let devicesUpdatedAt = 1;

    vi.spyOn(useMachineStore.getState(), "connectLive").mockResolvedValue(undefined);
    vi.spyOn(useMachineStore.getState(), "disconnectLive").mockImplementation(() => undefined);
    vi.spyOn(useDisplayStore.getState(), "connect").mockResolvedValue(undefined);
    vi.spyOn(useDisplayStore.getState(), "disconnect").mockImplementation(() => undefined);
    vi.spyOn(usePresenceStore.getState(), "signalPresence").mockResolvedValue(undefined);
    const reconnectPreferredScaleSpy = vi
      .spyOn(useMachineStore.getState(), "reconnectPreferredScale")
      .mockResolvedValue(undefined);

    queryMocks.useDevicesQuery.mockImplementation(() => ({
      data: devices,
      dataUpdatedAt: devicesUpdatedAt,
      error: null,
    }));

    const { rerender } = render(<BridgeShellEffects />);

    await waitFor(() => {
      expect(reconnectPreferredScaleSpy).toHaveBeenCalledTimes(1);
    });

    devices = [
      {
        id: "scale-1",
        name: "Acaia Lunar",
        state: "connected",
        type: "scale",
      },
    ];
    devicesUpdatedAt = 2;
    rerender(<BridgeShellEffects />);

    await waitFor(() => {
      expect(reconnectPreferredScaleSpy).toHaveBeenCalledTimes(1);
    });
  });
});
