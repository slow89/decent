import { useDevicesStore } from "@/stores/devices-store";
import { useMachineStore } from "@/stores/machine-store";

let cleanupCoordinator: (() => void) | null = null;

function shouldRequestAutoConnect() {
  const devicesState = useDevicesStore.getState();
  const machineState = useMachineStore.getState();
  const connectedScaleId =
    devicesState.devices.find((device) => device.type === "scale" && device.state === "connected")
      ?.id ?? null;
  const devicesPhase = devicesState.connectionStatus?.phase ?? null;

  if (connectedScaleId) {
    return false;
  }

  if (
    devicesState.autoConnectRequested ||
    devicesState.connection !== "live" ||
    machineState.liveConnection !== "live"
  ) {
    return false;
  }

  if (devicesState.scanning || (devicesPhase !== "idle" && devicesPhase !== "ready")) {
    return false;
  }

  return true;
}

function evaluateAutoConnect() {
  if (!shouldRequestAutoConnect()) {
    return;
  }

  void useDevicesStore.getState().requestAutoConnect();
}

export function initializeDeviceAutoConnectCoordinator() {
  if (cleanupCoordinator) {
    return cleanupCoordinator;
  }

  const unsubscribeDevices = useDevicesStore.subscribe((state, previousState) => {
    if (
      state.autoConnectRequested === previousState.autoConnectRequested &&
      state.connection === previousState.connection &&
      state.connectionStatus?.phase === previousState.connectionStatus?.phase &&
      state.scanning === previousState.scanning &&
      state.devices === previousState.devices
    ) {
      return;
    }

    evaluateAutoConnect();
  });

  const unsubscribeMachine = useMachineStore.subscribe((state, previousState) => {
    if (state.liveConnection === previousState.liveConnection) {
      return;
    }

    evaluateAutoConnect();
  });

  evaluateAutoConnect();

  cleanupCoordinator = () => {
    unsubscribeDevices();
    unsubscribeMachine();
    cleanupCoordinator = null;
  };

  return cleanupCoordinator;
}
