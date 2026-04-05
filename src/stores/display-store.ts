import { create } from "zustand";

import { BridgeClientError, createBridgeClient } from "@/rest/client";
import { displayStateSchema, type DisplayState } from "@/rest/types";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";

type DisplayConnectionState = "idle" | "connecting" | "live" | "error";

interface DisplayStoreState {
  connection: DisplayConnectionState;
  displayState: DisplayState | null;
  error: string | null;
  socket: WebSocket | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  releaseWakeLock: () => Promise<void>;
  requestWakeLock: () => Promise<void>;
  reset: () => void;
  setBrightness: (brightness: number) => Promise<void>;
}

type DisplayCommand =
  | {
      command: "setBrightness";
      brightness: number;
    }
  | {
      command: "requestWakeLock" | "releaseWakeLock";
    };

function getClient() {
  return createBridgeClient(useBridgeConfigStore.getState().gatewayUrl);
}

function getErrorMessage(error: unknown) {
  if (error instanceof BridgeClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected bridge error";
}

function sendDisplayCommand(socket: WebSocket | null, command: DisplayCommand) {
  if (socket == null || socket.readyState !== 1) {
    throw new BridgeClientError("Display stream is not connected");
  }

  socket.send(JSON.stringify(command));
}

export const useDisplayStore = create<DisplayStoreState>((set, get) => ({
  connection: "idle",
  displayState: null,
  error: null,
  socket: null,
  async connect() {
    get().disconnect();

    try {
      const client = getClient();
      const socket = client.createDisplaySocket();

      socket.onopen = () => {
        set({
          connection: "live",
          error: null,
        });
      };

      socket.onmessage = (event) => {
        const parsed = displayStateSchema.safeParse(JSON.parse(event.data));

        if (!parsed.success) {
          set({
            connection: "error",
            error: parsed.error.message,
          });
          return;
        }

        set({
          connection: "live",
          displayState: parsed.data,
          error: null,
        });
      };

      socket.onerror = () => {
        set({
          connection: "error",
          error: "Live display stream failed",
        });
      };

      socket.onclose = () => {
        set((state) => ({
          connection: "idle",
          displayState: state.socket === socket ? null : state.displayState,
          socket: state.socket === socket ? null : state.socket,
        }));
      };

      set({
        connection: "connecting",
        displayState: null,
        error: null,
        socket,
      });
    } catch (error) {
      set({
        connection: "error",
        displayState: null,
        error: getErrorMessage(error),
      });
    }
  },
  disconnect() {
    const socket = get().socket;

    if (socket) {
      socket.onclose = null;
      socket.close();
    }

    set({
      connection: "idle",
      displayState: null,
      error: null,
      socket: null,
    });
  },
  async refresh() {
    try {
      const displayState = await getClient().getDisplayState();

      set((state) => ({
        connection: state.connection === "idle" ? state.connection : "live",
        displayState,
        error: null,
      }));
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });
    }
  },
  async releaseWakeLock() {
    try {
      sendDisplayCommand(get().socket, {
        command: "releaseWakeLock",
      });

      set({
        error: null,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });
    }
  },
  async requestWakeLock() {
    try {
      sendDisplayCommand(get().socket, {
        command: "requestWakeLock",
      });

      set({
        error: null,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });
    }
  },
  reset() {
    get().disconnect();
  },
  async setBrightness(brightness) {
    try {
      sendDisplayCommand(get().socket, {
        brightness,
        command: "setBrightness",
      });

      set({
        error: null,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });
    }
  },
}));

export const displayStore = useDisplayStore;
