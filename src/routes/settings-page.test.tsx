import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/rest/query-client";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { useDisplayStore } from "@/stores/display-store";
import { usePresenceStore } from "@/stores/presence-store";
import { useThemeStore } from "@/stores/theme-store";

import { SettingsPage } from "./settings-page";

const { routerInvalidate, useDevicesQueryMock } = vi.hoisted(() => ({
  routerInvalidate: vi.fn(async () => undefined),
  useDevicesQueryMock: vi.fn(),
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
    useDevicesQuery: useDevicesQueryMock,
  };
});

describe("SettingsPage", () => {
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
    useDevicesQueryMock.mockReturnValue({
      data: [
        {
          id: "scale-1",
          name: "Acaia Lunar",
          state: "connected",
          type: "scale",
        },
      ],
      error: null,
      isFetching: false,
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
    expect(screen.getByText("connected")).toBeInTheDocument();
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

  it("shows the device loading state when the bridge query is refreshing", () => {
    useDevicesQueryMock.mockReturnValue({
      data: [],
      error: null,
      isFetching: true,
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
    });

    render(<SettingsPage />);

    expect(
      screen.getByText("No tracked devices are currently reported by the bridge."),
    ).toBeInTheDocument();
  });

  it("shows the device error state when discovery cannot be read", () => {
    useDevicesQueryMock.mockReturnValue({
      data: [],
      error: new Error("Bridge offline"),
      isFetching: false,
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
