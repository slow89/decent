import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBridgeConfigStore } from "@/stores/bridge-config-store";

import { useDisplayStore } from "./display-store";

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;
  readyState = 0;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.readyState = 3;
    this.onclose?.({} as CloseEvent);
  }

  emitMessage(data: unknown) {
    this.onmessage?.({
      data: JSON.stringify(data),
    } as MessageEvent);
  }

  emitOpen() {
    this.readyState = 1;
    this.onopen?.({} as Event);
  }
}

describe("useDisplayStore", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);

    useBridgeConfigStore.setState({
      gatewayUrl: "http://bridge.local:8080",
    });

    useDisplayStore.getState().reset();
  });

  it("connects to the display stream and stores the latest state", async () => {
    await useDisplayStore.getState().connect();

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0]?.url).toBe("ws://bridge.local:8080/ws/v1/display");

    MockWebSocket.instances[0]?.emitOpen();
    MockWebSocket.instances[0]?.emitMessage({
      wakeLockEnabled: true,
      wakeLockOverride: false,
      brightness: 75,
      requestedBrightness: 75,
      lowBatteryBrightnessActive: false,
      platformSupported: {
        brightness: true,
        wakeLock: true,
      },
    });

    expect(useDisplayStore.getState()).toMatchObject({
      connection: "live",
      displayState: {
        brightness: 75,
        wakeLockEnabled: true,
      },
    });
  });

  it("updates brightness through the REST API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        wakeLockEnabled: true,
        wakeLockOverride: false,
        brightness: 40,
        requestedBrightness: 40,
        lowBatteryBrightnessActive: false,
        platformSupported: {
          brightness: true,
          wakeLock: true,
        },
      }),
    } as Response);

    await useDisplayStore.getState().setBrightness(40);

    expect(useDisplayStore.getState().displayState).toMatchObject({
      brightness: 40,
      requestedBrightness: 40,
    });
  });
});
