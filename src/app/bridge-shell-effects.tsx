import { useEffect, useEffectEvent } from "react";

import { useBridgeConfigStore } from "@/stores/bridge-config-store";
import { devicesStore, useDevicesStore } from "@/stores/devices-store";
import { displayStore } from "@/stores/display-store";
import { useMachineStore } from "@/stores/machine-store";
import { presenceStore } from "@/stores/presence-store";

const activityEvents = ["keydown", "pointerdown", "touchstart"] as const;

export function BridgeShellEffects() {
  const gatewayUrl = useBridgeConfigStore((state) => state.gatewayUrl);
  const connectScale = useMachineStore((state) => state.connectScale);
  const disconnectScale = useMachineStore((state) => state.disconnectScale);
  const connectedScaleId = useDevicesStore(
    (state) =>
      state.devices.find((device) => device.type === "scale" && device.state === "connected")?.id ??
      null,
  );
  const signalPresence = useEffectEvent(() => {
    void presenceStore.getState().signalPresence();
  });
  const reconnectScaleFeed = useEffectEvent(() => {
    const currentScaleConnection = useMachineStore.getState().scaleConnection;

    if (currentScaleConnection === "connecting" || currentScaleConnection === "live") {
      return;
    }

    void connectScale();
  });

  useEffect(() => {
    void useMachineStore.getState().connectLive();
    devicesStore.getState().reset();
    displayStore.getState().reset();
    presenceStore.getState().reset();
    void devicesStore.getState().connect();
    void displayStore.getState().connect();

    return () => {
      useMachineStore.getState().disconnectLive();
      devicesStore.getState().disconnect();
      displayStore.getState().disconnect();
      presenceStore.getState().reset();
    };
  }, [gatewayUrl]);

  useEffect(() => {
    if (!connectedScaleId) {
      disconnectScale();
      return;
    }

    reconnectScaleFeed();
  }, [connectedScaleId, disconnectScale, reconnectScaleFeed]);

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
