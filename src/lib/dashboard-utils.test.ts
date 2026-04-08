import { getDashboardPrepStatus } from "@/lib/dashboard-utils";
import type { MachineSnapshot } from "@/rest/types";
import { describe, expect, it } from "vitest";

function buildSnapshot(state: string, substate = "idle"): MachineSnapshot {
  return {
    flow: 0,
    groupTemperature: 93,
    mixTemperature: 30,
    pressure: 0,
    profileFrame: 0,
    state: {
      state,
      substate,
    },
    steamTemperature: 150,
    targetFlow: 0,
    targetGroupTemperature: 93,
    targetMixTemperature: 93,
    targetPressure: 0,
    timestamp: "2026-04-05T12:00:00.000Z",
  };
}

describe("getDashboardPrepStatus", () => {
  it("hides water temperature while idle", () => {
    const status = getDashboardPrepStatus({
      isOffline: false,
      snapshot: buildSnapshot("idle"),
      timeToReady: {
        currentTemp: 93,
        remainingTimeMs: 0,
        status: "reached",
        targetTemp: 93,
        timestamp: 1_743_194_400_000,
      },
    });

    expect(status.items.map((item) => item.label)).toEqual(["Brew head", "Steam"]);
  });

  it("shows water temperature during espresso", () => {
    const status = getDashboardPrepStatus({
      isOffline: false,
      snapshot: buildSnapshot("espresso"),
      timeToReady: {
        currentTemp: 93,
        remainingTimeMs: 0,
        status: "reached",
        targetTemp: 93,
        timestamp: 1_743_194_400_000,
      },
    });

    expect(status.items.map((item) => item.label)).toEqual(["Water", "Brew head", "Steam"]);
  });

  it("treats an idle machine as ready even if the time-to-ready plugin is still collecting data", () => {
    const status = getDashboardPrepStatus({
      isOffline: false,
      snapshot: buildSnapshot("idle"),
      timeToReady: {
        currentTemp: 90,
        remainingTimeMs: null,
        status: "insufficient_data",
        targetTemp: 93,
        timestamp: 1_743_194_400_000,
      },
    });

    expect(status.title).toBe("Ready to brew");
    expect(status.tone).toBe("ready");
  });

  it("treats preparing-for-shot as heating even if the time-to-ready plugin has reached target", () => {
    const status = getDashboardPrepStatus({
      isOffline: false,
      snapshot: buildSnapshot("idle", "preparingForShot"),
      timeToReady: {
        currentTemp: 93,
        remainingTimeMs: 0,
        status: "reached",
        targetTemp: 93,
        timestamp: 1_743_194_400_000,
      },
    });

    expect(status.title).toBe("Heating up");
    expect(status.tone).toBe("warming");
  });
});
