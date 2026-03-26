import type { VisualizerPluginSettings } from "@/rest/types";

export function getVisualizerDraft(
  settings?: VisualizerPluginSettings | null,
) {
  return {
    Username: settings?.Username?.trim() ?? "",
    Password: settings?.Password?.trim() ?? "",
    AutoUpload: settings?.AutoUpload ?? false,
    LengthThreshold: settings?.LengthThreshold ?? 5,
  };
}

export function hasVisualizerCredentials(
  settings?: Pick<VisualizerPluginSettings, "Username" | "Password"> | null,
) {
  return Boolean(settings?.Username?.trim() && settings?.Password?.trim());
}

export function isVisualizerEnabled(settings?: VisualizerPluginSettings | null) {
  return Boolean(settings?.AutoUpload && hasVisualizerCredentials(settings));
}

export function getVisualizerCredentialKey(settings: {
  Username: string;
  Password: string;
}) {
  return `${settings.Username.trim()}\n${settings.Password.trim()}`;
}
