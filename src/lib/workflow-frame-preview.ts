import type { WorkflowProfile } from "@/rest/types";

export type FrameRecord = Record<string, unknown>;

export type FramePreviewData = {
  frames: FrameRecord[];
  numericKeys: string[];
  defaultSeriesKeys: string[];
};

const preferredFrameKeys = [
  "pressure",
  "flow",
  "temperature",
  "seconds",
  "duration",
  "volume",
  "weight",
] as const;

export const seriesColors = [
  "#f7b437",
  "#39c97b",
  "#ff7b57",
  "#66c9ff",
  "#c792ea",
] as const;

export function buildFramePreviewData(profile: WorkflowProfile): FramePreviewData {
  const frames = (profile.steps ?? []).filter(
    (step): step is FrameRecord => typeof step === "object" && step !== null,
  );
  const numericFieldCounts = new Map<string, number>();

  frames.forEach((frame) => {
    Object.entries(frame).forEach(([key, value]) => {
      if (getNumericValue(value) != null) {
        numericFieldCounts.set(key, (numericFieldCounts.get(key) ?? 0) + 1);
      }
    });
  });

  const numericKeys = [...numericFieldCounts.entries()]
    .sort(([leftKey, leftCount], [rightKey, rightCount]) => {
      const leftPreferredIndex = preferredFrameKeys.indexOf(
        leftKey as (typeof preferredFrameKeys)[number],
      );
      const rightPreferredIndex = preferredFrameKeys.indexOf(
        rightKey as (typeof preferredFrameKeys)[number],
      );

      if (leftPreferredIndex !== -1 || rightPreferredIndex !== -1) {
        if (leftPreferredIndex === -1) {
          return 1;
        }

        if (rightPreferredIndex === -1) {
          return -1;
        }

        return leftPreferredIndex - rightPreferredIndex;
      }

      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }

      return leftKey.localeCompare(rightKey);
    })
    .map(([key]) => key);

  return {
    frames,
    numericKeys,
    defaultSeriesKeys: numericKeys.slice(0, 3),
  };
}

export function getNumericValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatSeriesKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatFrameValue(value: unknown) {
  if (value == null) {
    return "-";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return `${value}`;
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}
