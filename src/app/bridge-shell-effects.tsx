import {
  useEffect,
  useEffectEvent,
} from "react";

import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { displayStore } from "@/stores/display-store";
import { presenceStore } from "@/stores/presence-store";

const activityEvents = [
  "keydown",
  "pointerdown",
  "touchstart",
] as const;

export function BridgeShellEffects() {
  const gatewayUrl = useBridgeConfigStore((state) => state.gatewayUrl);
  const signalPresence = useEffectEvent(() => {
    void presenceStore.getState().signalPresence();
  });

  useEffect(() => {
    displayStore.getState().reset();
    presenceStore.getState().reset();
    void displayStore.getState().connect();

    return () => {
      displayStore.getState().disconnect();
      presenceStore.getState().reset();
    };
  }, [gatewayUrl]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void presenceStore.getState().signalPresence(true);
      }
    }

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, signalPresence, { passive: true });
    }

    window.addEventListener("focus", signalPresence);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    void presenceStore.getState().signalPresence(true);

    return () => {
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, signalPresence);
      }

      window.removeEventListener("focus", signalPresence);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [signalPresence]);

  return null;
}
