import { describe, expect, it } from "vitest";

import type { ShotMeasurement } from "@/rest/types";

import {
  adaptShotMeasurementsToTelemetry,
  getShotDurationSeconds,
  getShotFinalWeight,
} from "./shot-history";

const measurements: ShotMeasurement[] = [
  {
    machine: {
      timestamp: "2026-03-21T12:00:00.000Z",
      state: {
        state: "espresso",
        substate: "preparingForShot",
      },
      flow: 0.3,
      pressure: 0.9,
      targetFlow: 2.5,
      targetPressure: 8.5,
      mixTemperature: 92.5,
      groupTemperature: 91.5,
      targetMixTemperature: 93,
      targetGroupTemperature: 93,
      profileFrame: 0,
      steamTemperature: 140,
    },
    scale: {
      timestamp: "2026-03-21T12:00:00.000Z",
      weight: 0.2,
      weightFlow: 0.4,
      timerValue: null,
    },
    volume: 0,
  },
  {
    machine: {
      timestamp: "2026-03-21T12:00:01.000Z",
      state: {
        state: "espresso",
        substate: "pouring",
      },
      flow: 2.7,
      pressure: 8.4,
      targetFlow: 2.5,
      targetPressure: 8.5,
      mixTemperature: 93.1,
      groupTemperature: 92.2,
      targetMixTemperature: 93,
      targetGroupTemperature: 93,
      profileFrame: 2,
      steamTemperature: 140,
    },
    scale: {
      timestamp: "2026-03-21T12:00:01.000Z",
      weight: 18.4,
      weightFlow: 2.2,
      timerValue: 1100,
    },
    volume: 0,
  },
  {
    machine: {
      timestamp: "2026-03-21T12:00:02.000Z",
      state: {
        state: "idle",
        substate: "idle",
      },
      flow: 0,
      pressure: 0,
      targetFlow: 0,
      targetPressure: 0,
      mixTemperature: 93.1,
      groupTemperature: 92.2,
      targetMixTemperature: 93,
      targetGroupTemperature: 93,
      profileFrame: 0,
      steamTemperature: 140,
    },
    scale: {
      timestamp: "2026-03-21T12:00:02.000Z",
      weight: 20.1,
      weightFlow: 0.3,
      timerValue: 1800,
    },
    volume: 0,
  },
];

describe("shot history telemetry adapter", () => {
  it("maps measurements into telemetry samples and trims trailing idle machine data", () => {
    const telemetry = adaptShotMeasurementsToTelemetry(measurements);

    expect(telemetry).toHaveLength(2);
    expect(telemetry[0]).toMatchObject({
      state: "espresso",
      substate: "preparingForShot",
      pressure: 0.9,
      flow: 0.3,
      shotElapsedSeconds: 0,
    });
    expect(telemetry[1]).toMatchObject({
      state: "espresso",
      substate: "pouring",
      pressure: 8.4,
      flow: 2.7,
      shotElapsedSeconds: 1.1,
    });
    expect(telemetry[1]?.elapsedSeconds).toBe(1);
  });

  it("keeps chart generation working when scale data is partially missing", () => {
    const telemetry = adaptShotMeasurementsToTelemetry([
      {
        ...measurements[0],
        scale: null,
      },
      {
        ...measurements[1],
        scale: {
          timestamp: "2026-03-21T12:00:01.000Z",
          weight: 18.4,
          weightFlow: null,
          timerValue: null,
        },
      },
    ]);

    expect(telemetry).toHaveLength(2);
    expect(telemetry[0]?.shotElapsedSeconds).toBe(0);
    expect(telemetry[1]?.shotElapsedSeconds).toBe(1);
  });

  it("derives duration and final beverage weight from scale history", () => {
    expect(getShotDurationSeconds(measurements)).toBe(1.8);
    expect(getShotFinalWeight(measurements)).toBe(20.1);
  });
});
