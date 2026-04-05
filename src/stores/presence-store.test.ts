import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBridgeConfigStore } from "@/stores/bridge-config-store";

import { usePresenceStore } from "./presence-store";

describe("usePresenceStore", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23T12:00:00Z"));

    useBridgeConfigStore.setState({
      gatewayUrl: "http://bridge.local:8080",
    });

    usePresenceStore.getState().reset();
  });

  it("forwards each activity signal to the gateway", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ timeout: 1800 }),
    } as Response);

    await usePresenceStore.getState().signalPresence(true);
    await usePresenceStore.getState().signalPresence();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(usePresenceStore.getState().timeoutSeconds).toBe(1800);
  });

  it("stores bridge errors for failed heartbeats", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "offline" }),
    } as Response);

    await usePresenceStore.getState().signalPresence(true);

    expect(usePresenceStore.getState().error).toContain("Request failed with status 500");
  });
});
