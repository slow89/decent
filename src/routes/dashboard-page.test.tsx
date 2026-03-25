import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMachineStore } from "@/stores/machine-store";

import { DashboardPage } from "./dashboard-page";

const queryMocks = vi.hoisted(() => ({
  useDevicesQuery: vi.fn(),
  useMachineStateQuery: vi.fn(),
  useRequestMachineStateMutation: vi.fn(),
  useTareScaleMutation: vi.fn(),
  useUpdateWorkflowMutation: vi.fn(),
  useWorkflowQuery: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/workflows">{children}</a>,
}));

vi.mock("@/rest/queries", async () => {
  const actual = await vi.importActual<typeof import("@/rest/queries")>("@/rest/queries");

  return {
    ...actual,
    useDevicesQuery: queryMocks.useDevicesQuery,
    useMachineStateQuery: queryMocks.useMachineStateQuery,
    useRequestMachineStateMutation: queryMocks.useRequestMachineStateMutation,
    useTareScaleMutation: queryMocks.useTareScaleMutation,
    useUpdateWorkflowMutation: queryMocks.useUpdateWorkflowMutation,
    useWorkflowQuery: queryMocks.useWorkflowQuery,
  };
});

vi.mock("@/components/telemetry-chart", () => ({
  TelemetryChart: ({ data }: { data: Array<unknown> }) => (
    <div data-testid="telemetry-chart">{`samples:${data.length}`}</div>
  ),
}));

describe("DashboardPage", () => {
  const requestMachineStateMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useMachineStore.setState({
      error: null,
      liveConnection: "live",
      scaleConnection: "idle",
      scaleSnapshot: null,
      telemetry: [],
      waterLevels: null,
    });

    queryMocks.useDevicesQuery.mockReturnValue({
      data: [],
      error: null,
    });
    queryMocks.useTareScaleMutation.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    queryMocks.useUpdateWorkflowMutation.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    queryMocks.useWorkflowQuery.mockReturnValue({
      data: {
        id: "workflow-1",
        name: "Morning",
        profile: {
          title: "House",
          steps: [],
        },
        context: {
          targetDoseWeight: 18,
          targetYield: 36,
        },
        steamSettings: {
          duration: 50,
          flow: 1.5,
        },
        rinseData: {
          duration: 10,
        },
        hotWaterData: {
          targetTemperature: 75,
          volume: 50,
        },
      },
      error: null,
    });
    queryMocks.useRequestMachineStateMutation.mockReturnValue({
      isPending: false,
      mutate: requestMachineStateMutate,
    });
  });

  it("puts the machine to sleep from the power control when it is awake", async () => {
    queryMocks.useMachineStateQuery.mockReturnValue({
      data: buildSnapshot("idle"),
      error: null,
    });

    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: "Sleep machine" }));

    await waitFor(() => {
      expect(requestMachineStateMutate).toHaveBeenCalledWith("sleeping");
    });
    expect(screen.getByRole("button", { name: "Sleep machine" })).toBeInTheDocument();
  });

  it("wakes the machine from the power control when it is sleeping", async () => {
    queryMocks.useMachineStateQuery.mockReturnValue({
      data: buildSnapshot("sleeping"),
      error: null,
    });

    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: "Wake machine" }));

    await waitFor(() => {
      expect(requestMachineStateMutate).toHaveBeenCalledWith("idle");
    });
    expect(screen.getByRole("button", { name: "Wake machine" })).toBeInTheDocument();
  });
});

function buildSnapshot(state: string) {
  return {
    timestamp: "2026-03-25T10:00:00.000Z",
    state: {
      state,
      substate: state,
    },
    flow: 0,
    pressure: 0,
    targetFlow: 0,
    targetPressure: 0,
    mixTemperature: 93,
    groupTemperature: 92,
    targetMixTemperature: 93,
    targetGroupTemperature: 93,
    profileFrame: 0,
    steamTemperature: 135,
  };
}
