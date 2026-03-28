import { beforeEach, describe, expect, it, vi } from "vitest";

import { BridgeClientError, createBridgeClient } from "./client";

describe("createBridgeClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("surfaces JSON REST error bodies from failed requests", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: "Bridge offline" }),
    } as Response);

    await expect(
      createBridgeClient("http://bridge.local:8080").getMachineState(),
    ).rejects.toEqual(
      expect.objectContaining<Partial<BridgeClientError>>({
        message: "Bridge offline",
        status: 500,
      }),
    );
  });

  it("falls back to plain-text REST error bodies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "upstream timeout",
    } as Response);

    await expect(
      createBridgeClient("http://bridge.local:8080").getWorkflow(),
    ).rejects.toEqual(
      expect.objectContaining<Partial<BridgeClientError>>({
        message: "upstream timeout",
        status: 503,
      }),
    );
  });
});
