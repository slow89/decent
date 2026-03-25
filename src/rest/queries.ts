import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createBridgeClient } from "@/rest/client";
import { queryClient } from "@/rest/query-client";
import { type MachineStateChange, type ProfileRecord } from "@/rest/types";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";

function getClient() {
  return createBridgeClient(useBridgeConfigStore.getState().gatewayUrl);
}

export const bridgeQueryKeys = {
  all: ["bridge"] as const,
  machineState: () => [...bridgeQueryKeys.all, "machine-state"] as const,
  workflow: () => [...bridgeQueryKeys.all, "workflow"] as const,
  profiles: () => [...bridgeQueryKeys.all, "profiles"] as const,
  profile: (id: string) => [...bridgeQueryKeys.all, "profiles", id] as const,
  devices: () => [...bridgeQueryKeys.all, "devices"] as const,
  shots: () => [...bridgeQueryKeys.all, "shots"] as const,
  shot: (id: string) => [...bridgeQueryKeys.all, "shots", id] as const,
};

export const machineStateQueryOptions = () =>
  queryOptions({
    queryKey: bridgeQueryKeys.machineState(),
    queryFn: () => getClient().getMachineState(),
  });

export const workflowQueryOptions = () =>
  queryOptions({
    queryKey: bridgeQueryKeys.workflow(),
    queryFn: () => getClient().getWorkflow(),
  });

export const devicesQueryOptions = () =>
  queryOptions({
    queryKey: bridgeQueryKeys.devices(),
    queryFn: () => getClient().listDevices(),
  });

export const profilesQueryOptions = () =>
  queryOptions({
    queryKey: bridgeQueryKeys.profiles(),
    queryFn: () => getClient().listProfiles(),
  });

export const shotsQueryOptions = () =>
  queryOptions({
    queryKey: bridgeQueryKeys.shots(),
    queryFn: () => getClient().listShots(),
  });

export const shotQueryOptions = (id: string) =>
  queryOptions({
    queryKey: bridgeQueryKeys.shot(id),
    queryFn: () => getClient().getShot(id),
    enabled: Boolean(id),
  });

export function useMachineStateQuery() {
  return useQuery(machineStateQueryOptions());
}

export function useWorkflowQuery() {
  return useQuery(workflowQueryOptions());
}

export function useDevicesQuery() {
  return useQuery(devicesQueryOptions());
}

export function useProfilesQuery() {
  return useQuery(profilesQueryOptions());
}

export function useShotsQuery() {
  return useQuery(shotsQueryOptions());
}

export function useShotQuery(id: string | null | undefined) {
  return useQuery({
    ...shotQueryOptions(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useScanDevicesMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (options?: { connect?: boolean }) => getClient().scanDevices(options),
    onSuccess: (devices) => {
      client.setQueryData(bridgeQueryKeys.devices(), devices);
    },
  });
}

export function useConnectDeviceMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => getClient().connectDevice(deviceId),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: bridgeQueryKeys.devices(),
      });
    },
  });
}

export function useDisconnectDeviceMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => getClient().disconnectDevice(deviceId),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: bridgeQueryKeys.devices(),
      });
    },
  });
}

export function useUpdateWorkflowMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      getClient().updateWorkflow(patch),
    onSuccess: (workflow) => {
      client.setQueryData(bridgeQueryKeys.workflow(), workflow);
    },
  });
}

export function useImportProfilesMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (records: ProfileRecord[]) => getClient().importProfiles(records),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: bridgeQueryKeys.profiles(),
      });
    },
  });
}

export function useExportProfilesMutation() {
  return useMutation({
    mutationFn: () => getClient().exportProfiles(),
  });
}

export function useRestoreDefaultProfileMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (filename: string) => getClient().restoreDefaultProfile(filename),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: bridgeQueryKeys.profiles(),
      });
    },
  });
}

export function useRequestMachineStateMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (nextState: MachineStateChange) =>
      getClient().requestMachineState(nextState),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: bridgeQueryKeys.machineState(),
      });
    },
  });
}

export function useTareScaleMutation() {
  return useMutation({
    mutationFn: () => getClient().tareScale(),
  });
}

export async function prefetchOverviewQueries() {
  await Promise.all([
    queryClient.prefetchQuery(machineStateQueryOptions()),
    queryClient.prefetchQuery(workflowQueryOptions()),
    queryClient.prefetchQuery(devicesQueryOptions()),
    queryClient.prefetchQuery(shotsQueryOptions()),
  ]);
}

export async function prefetchWorkflowQuery() {
  await Promise.all([
    queryClient.prefetchQuery(workflowQueryOptions()),
    queryClient.prefetchQuery(profilesQueryOptions()),
  ]);
}

export async function prefetchShotsQuery() {
  await queryClient.prefetchQuery(shotsQueryOptions());
}

export async function prefetchDevicesQuery() {
  await queryClient.prefetchQuery(devicesQueryOptions());
}
