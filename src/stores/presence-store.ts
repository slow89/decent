import { create } from "zustand";

import { BridgeClientError, createBridgeClient } from "@/rest/client";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";

interface PresenceState {
  error: string | null;
  isSending: boolean;
  timeoutSeconds: number | null;
  reset: () => void;
  signalPresence: (force?: boolean) => Promise<void>;
}

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

export const usePresenceStore = create<PresenceState>((set, get) => ({
  error: null,
  isSending: false,
  timeoutSeconds: null,
  reset() {
    set({
      error: null,
      isSending: false,
      timeoutSeconds: null,
    });
  },
  async signalPresence(_force = false) {
    const { isSending } = get();

    if (isSending) {
      return;
    }

    set({
      error: null,
      isSending: true,
    });

    try {
      const response = await getClient().signalHeartbeat();

      set({
        error: null,
        isSending: false,
        timeoutSeconds: response.timeout,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isSending: false,
      });
    }
  },
}));

export const presenceStore = usePresenceStore;
