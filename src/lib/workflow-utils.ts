import type { WorkflowProfile } from "@/rest/types";

export function readString(formData: FormData, key: string, fallback: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

export function getProfileTitle(profile: WorkflowProfile | undefined) {
  return profile?.title?.trim() || "Untitled profile";
}

export function getProfileFingerprint(profile: WorkflowProfile | undefined) {
  if (!profile) {
    return "no-profile";
  }

  return JSON.stringify({
    author: profile.author,
    beverage_type: profile.beverage_type,
    notes: profile.notes,
    steps: profile.steps,
    tank_temperature: profile.tank_temperature,
    target_volume: profile.target_volume,
    target_volume_count_start: profile.target_volume_count_start,
    target_weight: profile.target_weight,
    title: profile.title,
    version: profile.version,
  });
}

export function joinValues(values: Array<string | null | undefined>) {
  const presentValues = values.filter((value): value is string => Boolean(value?.trim()));

  if (!presentValues.length) {
    return "Nothing linked";
  }

  return presentValues.join(" / ");
}
