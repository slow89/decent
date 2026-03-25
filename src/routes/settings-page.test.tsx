import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/rest/query-client";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { useDisplayStore } from "@/stores/display-store";
import { usePresenceStore } from "@/stores/presence-store";
import { useThemeStore } from "@/stores/theme-store";

import { SettingsPage } from "./settings-page";

const {
  routerInvalidate,
  useConnectDeviceMutationMock,
  useDevicesQueryMock,
  useDisconnectDeviceMutationMock,
  useScanDevicesMutationMock,
} = vi.hoisted(() => ({
  useConnectDeviceMutationMock: vi.fn(),
  useDisconnectDeviceMutationMock: vi.fn(),
  routerInvalidate: vi.fn(async () => undefined),
  useDevicesQueryMock: vi.fn(),
  useScanDevicesMutationMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    invalidate: routerInvalidate,
  }),
}));

vi.mock("@/rest/queries", async () => {
  const actual = await vi.importActual<typeof import("@/rest/queries")>("@/rest/queries");

  return {
    ...actual,
    useConnectDeviceMutation: useConnectDeviceMutationMock,
    useDisconnectDeviceMutation: useDisconnectDeviceMutationMock,
    useDevicesQuery: useDevicesQueryMock,
    useScanDevicesMutation: useScanDevicesMutationMock,
  };
});

describe("SettingsPage", () => {
  const connectMutateAsync = vi.fn(async () => undefined);
  const disconnectMutateAsync = vi.fn(async () => undefined);
  const scanMutateAsync = vi.fn(async () => []);

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    useBridgeConfigStore.setState({
      gatewayUrl: "http://bridge.local:8080",
    });
    useDisplayStore.setState({
      connection: "live",
      displayState: {
        wakeLockEnabled: true,
        wakeLockOverride: false,
        brightness: 75,
        requestedBrightness: 75,
        lowBatteryBrightnessActive: false,
        platformSupported: {
          brightness: true,
          wakeLock: true,
        },
      },
      error: null,
      socket: null,
    });
    usePresenceStore.setState({
      error: null,
      isSending: false,
      lastHeartbeatAt: null,
      timeoutSeconds: 1800,
    });
    useThemeStore.setState({
      theme: "dark",
    });
    document.documentElement.dataset.theme = "dark";

    routerInvalidate.mockResolvedValue(undefined);
    useConnectDeviceMutationMock.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: connectMutateAsync,
      variables: null,
    });
    useDisconnectDeviceMutationMock.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: disconnectMutateAsync,
      variables: null,
    });
    useDevicesQueryMock.mockReturnValue({
      data: [
        {
          id: "scale-1",
          name: "Acaia Lunar",
          state: "connected",
          type: "scale",
        },
        {
          id: "machine-2",
          name: "DE1XL",
          state: "disconnected",
          type: "machine",
        },
      ],
      error: null,
      isFetching: false,
      refetch: vi.fn(async () => undefined),
    });
    useScanDevicesMutationMock.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: scanMutateAsync,
    });
  });

  it("shows the current bridge URL and endpoint preview", () => {
    render(<SettingsPage />);

    expect(screen.getByDisplayValue("http://bridge.local:8080")).toBeInTheDocument();
    expect(screen.getByText("http://bridge.local:8080/api/v1/workflow")).toBeInTheDocument();
    expect(
      screen.getByText("ws://bridge.local:8080/ws/v1/machine/snapshot"),
    ).toBeInTheDocument();
    expect(screen.getByText("ws://bridge.local:8080/ws/v1/display")).toBeInTheDocument();
    expect(screen.getByText("1800s")).toBeInTheDocument();
    expect(screen.getByText("Auto-managed on")).toBeInTheDocument();
    expect(screen.getByText("Acaia Lunar")).toBeInTheDocument();
    expect(screen.getByText("DE1XL")).toBeInTheDocument();
    expect(screen.getByText("connected")).toBeInTheDocument();
    expect(screen.getByText("disconnected")).toBeInTheDocument();
    expect(screen.getByText("Scale Pairing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Disconnect scale" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect machine" })).toBeInTheDocument();
  });

  it("saves the updated bridge URL and invalidates bridge data", async () => {
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);

    render(<SettingsPage />);

    fireEvent.change(screen.getByLabelText("REST origin"), {
      target: { value: "http://new-bridge.local:8080/" },
    });
    fireEvent.click(screen.getByText("Save and reconnect"));

    await waitFor(() => {
      expect(useBridgeConfigStore.getState().gatewayUrl).toBe(
        "http://new-bridge.local:8080",
      );
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["bridge"],
    });
    expect(routerInvalidate).toHaveBeenCalled();
  });

  it("fills the draft URL with the current browser origin", () => {
    render(<SettingsPage />);

    fireEvent.change(screen.getByLabelText("REST origin"), {
      target: { value: "http://scratch.local:8080" },
    });
    fireEvent.click(screen.getByText("Use current origin"));

    expect(screen.getByDisplayValue(window.location.origin)).toBeInTheDocument();
  });

  it("connects a disconnected device from device discovery", async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Connect machine" }));

    await waitFor(() => {
      expect(connectMutateAsync).toHaveBeenCalledWith("machine-2");
    });
  });

  it("disconnects a connected device from device discovery", async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Disconnect scale" }));

    await waitFor(() => {
      expect(disconnectMutateAsync).toHaveBeenCalledWith("scale-1");
    });
  });

  it("shows an explicit pair action for discovered scales", () => {
    useDevicesQueryMock.mockReturnValue({
      data: [
        {
          id: "scale-1",
          name: "Acaia Lunar",
          state: "disconnected",
          type: "scale",
        },
      ],
      error: null,
      isFetching: false,
      refetch: vi.fn(async () => undefined),
    });

    render(<SettingsPage />);

    expect(screen.getByRole("button", { name: "Pair scale" })).toBeInTheDocument();
    expect(
      screen.getByText("Discovered scales can be paired directly from this page."),
    ).toBeInTheDocument();
  });

  it("can scan without automatically connecting devices", async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Scan only" }));

    await waitFor(() => {
      expect(scanMutateAsync).toHaveBeenCalledWith({ connect: false });
    });
  });

  it("shows the device loading state when the bridge query is refreshing", () => {
    useDevicesQueryMock.mockReturnValue({
      data: [],
      error: null,
      isFetching: true,
      refetch: vi.fn(async () => undefined),
    });

    render(<SettingsPage />);

    expect(
      screen.getByText("Checking the bridge for tracked devices."),
    ).toBeInTheDocument();
  });

  it("shows the empty device state when no tracked devices are returned", () => {
    useDevicesQueryMock.mockReturnValue({
      data: [],
      error: null,
      isFetching: false,
      refetch: vi.fn(async () => undefined),
    });

    render(<SettingsPage />);

    expect(
      screen.getByText("No tracked devices are currently reported by the bridge."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Run a scan, then pair your scale here."),
    ).toBeInTheDocument();
  });

  it("shows the device error state when discovery cannot be read", () => {
    useDevicesQueryMock.mockReturnValue({
      data: [],
      error: new Error("Bridge offline"),
      isFetching: false,
      refetch: vi.fn(async () => undefined),
    });

    render(<SettingsPage />);

    expect(
      screen.getByText((content) => content.includes("Device state is unavailable right now.")),
    ).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("Bridge offline"))).toBeInTheDocument();
  });

  it("switches the app theme from settings", () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Light" }));

    expect(useThemeStore.getState().theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByText("light")).toBeInTheDocument();
  });
});
