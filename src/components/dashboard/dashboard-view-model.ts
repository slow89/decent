import type { DashboardShotSummaryItem } from "@/components/dashboard/dashboard-tablet-shot-summary";
import { formatSecondaryNumber } from "@/lib/dashboard-utils";
import {
  formatBrewRatio,
  formatPrimaryNumber,
  roundValue,
  type RecipePreset,
} from "@/lib/recipe-utils";
import {
  useMachineStateQuery,
  useUpdateWorkflowMutation,
  useWorkflowQuery,
} from "@/rest/queries";
import type { WorkflowRecord } from "@/rest/types";

export type DashboardControlRow = {
  activePresetValue: number;
  detail?: string;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onPresetClick: (value: number) => void;
  presets: ReadonlyArray<RecipePreset>;
  tint: string;
  value: string;
};

export type DashboardRecipeControls = {
  doseActivePresetValue: number;
  dosePresets: ReadonlyArray<RecipePreset>;
  doseValue: string;
  drinkActivePresetValue: number;
  drinkDetail: string;
  drinkPresets: ReadonlyArray<RecipePreset>;
  drinkValue: string;
  onDecreaseDose: () => void;
  onDecreaseDrink: () => void;
  onIncreaseDose: () => void;
  onIncreaseDrink: () => void;
  onSelectDosePreset: (value: number) => void;
  onSelectDrinkPreset: (value: number) => void;
};

type DashboardWorkflowControls = {
  isUpdatingWorkflow: boolean;
  machineQueryError: Error | null;
  snapshot: ReturnType<typeof useMachineStateQuery>["data"];
  updateBrewTemperature: (nextTemperature: number) => void;
  updateDose: (nextDose: number) => void;
  updateFlushDuration: (nextDuration: number) => void;
  updateHotWaterVolume: (nextVolume: number) => void;
  updateSteamDuration: (nextDuration: number) => void;
  updateYield: (nextYield: number) => void;
  workflow: ReturnType<typeof useWorkflowQuery>["data"];
  workflowQueryError: Error | null;
};

export function useDashboardWorkflowControls(): DashboardWorkflowControls {
  const { data: snapshot, error: machineQueryError } = useMachineStateQuery();
  const { data: workflow, error: workflowQueryError } = useWorkflowQuery();
  const updateWorkflowMutation = useUpdateWorkflowMutation();

  function updateWorkflow(patch: Record<string, unknown>) {
    updateWorkflowMutation.mutate(patch);
  }

  function updateDose(nextDose: number) {
    updateWorkflow({
      context: {
        targetDoseWeight: roundValue(nextDose, 0.1),
      },
    });
  }

  function updateYield(nextYield: number) {
    updateWorkflow({
      context: {
        targetYield: roundValue(nextYield, 0.1),
      },
    });
  }

  function updateBrewTemperature(nextTemperature: number) {
    const nextSteps = workflow?.profile?.steps?.map((step) => {
      if (
        typeof step === "object" &&
        step !== null &&
        "temperature" in step &&
        typeof step.temperature === "number"
      ) {
        return {
          ...step,
          temperature: nextTemperature,
        };
      }

      return step;
    });

    if (!nextSteps?.length) {
      return;
    }

    updateWorkflow({
      profile: {
        steps: nextSteps,
      },
    });
  }

  function updateSteamDuration(nextDuration: number) {
    updateWorkflow({
      steamSettings: {
        duration: roundValue(nextDuration, 1),
      },
    });
  }

  function updateFlushDuration(nextDuration: number) {
    updateWorkflow({
      rinseData: {
        duration: roundValue(nextDuration, 1),
      },
    });
  }

  function updateHotWaterVolume(nextVolume: number) {
    updateWorkflow({
      hotWaterData: {
        volume: roundValue(nextVolume, 1),
      },
    });
  }

  return {
    isUpdatingWorkflow: updateWorkflowMutation.isPending,
    machineQueryError,
    snapshot,
    updateBrewTemperature,
    updateDose,
    updateFlushDuration,
    updateHotWaterVolume,
    updateSteamDuration,
    updateYield,
    workflow,
    workflowQueryError,
  };
}

export function useDashboardRecipeControls({
  updateDose,
  updateYield,
  workflow,
}: Pick<
  DashboardWorkflowControls,
  "updateDose" | "updateYield" | "workflow"
>): DashboardRecipeControls {
  const targetDose = workflow?.context?.targetDoseWeight;
  const targetYield = workflow?.context?.targetYield;
  const ratio = formatBrewRatio(targetDose, targetYield);
  const dosePresets = [
    { label: "16g", value: 16 },
    { label: "18g", value: 18 },
    { label: "20g", value: 20 },
    { label: "22g", value: 22 },
  ] as const;
  const drinkPresets = [
    { label: "1:1.5", value: 1.5 },
    { label: "1:2.0", value: 2.0 },
    { label: "1:2.5", value: 2.5 },
    { label: "1:3.0", value: 3.0 },
  ] as const;

  return {
    doseActivePresetValue: targetDose ?? 18,
    dosePresets,
    doseValue: formatPrimaryNumber(targetDose, "g", "18g", 0),
    drinkActivePresetValue: targetDose && targetYield ? targetYield / targetDose : 2.0,
    drinkDetail: `(${ratio})`,
    drinkPresets,
    drinkValue: formatPrimaryNumber(targetYield, "g", "36g", 0),
    onDecreaseDose: () => updateDose(Math.max(8, Math.round((targetDose ?? 18) - 1))),
    onDecreaseDrink: () => updateYield(Math.max(1, Math.round((targetYield ?? 36) - 1))),
    onIncreaseDose: () => updateDose(Math.round((targetDose ?? 18) + 1)),
    onIncreaseDrink: () => updateYield(Math.round((targetYield ?? 36) + 1)),
    onSelectDosePreset: (value: number) => updateDose(value),
    onSelectDrinkPreset: (value: number) => updateYield((targetDose ?? 18) * value),
  };
}

export function useDashboardControlRows({
  snapshot,
  updateBrewTemperature,
  updateFlushDuration,
  updateHotWaterVolume,
  updateSteamDuration,
  workflow,
}: Pick<
  DashboardWorkflowControls,
  | "snapshot"
  | "updateBrewTemperature"
  | "updateFlushDuration"
  | "updateHotWaterVolume"
  | "updateSteamDuration"
  | "workflow"
>): ReadonlyArray<DashboardControlRow> {
  return [
    {
      label: "Brew",
      value: formatPrimaryNumber(snapshot?.mixTemperature, "°C", "87°C", 0),
      detail: undefined,
      activePresetValue: snapshot?.mixTemperature ?? 87,
      presets: [
        { label: "75°C", value: 75 },
        { label: "80°C", value: 80 },
        { label: "85°C", value: 85 },
        { label: "92°C", value: 92 },
      ],
      tint: "text-highlight-muted",
      onDecrease: () =>
        updateBrewTemperature(Math.max(70, Math.round((snapshot?.mixTemperature ?? 87) - 1))),
      onIncrease: () =>
        updateBrewTemperature(Math.round((snapshot?.mixTemperature ?? 87) + 1)),
      onPresetClick: (value: number) => updateBrewTemperature(value),
    },
    {
      label: "Steam",
      value: formatPrimaryNumber(workflow?.steamSettings?.duration, "s", "50s", 0),
      detail: formatSecondaryNumber(workflow?.steamSettings?.flow, "", "1.5"),
      activePresetValue: workflow?.steamSettings?.duration ?? 50,
      presets: [
        { label: "15s", value: 15 },
        { label: "30s", value: 30 },
        { label: "45s", value: 45 },
        { label: "60s", value: 60 },
      ],
      tint: "text-highlight-muted",
      onDecrease: () =>
        updateSteamDuration(Math.max(5, (workflow?.steamSettings?.duration ?? 50) - 5)),
      onIncrease: () => updateSteamDuration((workflow?.steamSettings?.duration ?? 50) + 5),
      onPresetClick: (value: number) => updateSteamDuration(value),
    },
    {
      label: "Flush",
      value: formatPrimaryNumber(workflow?.rinseData?.duration, "s", "10s", 0),
      detail: undefined,
      activePresetValue: workflow?.rinseData?.duration ?? 10,
      presets: [
        { label: "5s", value: 5 },
        { label: "10s", value: 10 },
        { label: "15s", value: 15 },
        { label: "20s", value: 20 },
      ],
      tint: "text-highlight-muted",
      onDecrease: () =>
        updateFlushDuration(Math.max(1, (workflow?.rinseData?.duration ?? 10) - 1)),
      onIncrease: () => updateFlushDuration((workflow?.rinseData?.duration ?? 10) + 1),
      onPresetClick: (value: number) => updateFlushDuration(value),
    },
    {
      label: "Hot Water",
      value: formatPrimaryNumber(workflow?.hotWaterData?.volume, "ml", "50ml", 0),
      detail: formatPrimaryNumber(
        workflow?.hotWaterData?.targetTemperature,
        "°C",
        "75°C",
        0,
      ),
      activePresetValue: workflow?.hotWaterData?.volume ?? 50,
      presets: [
        { label: "50ml", value: 50 },
        { label: "100ml", value: 100 },
        { label: "150ml", value: 150 },
        { label: "200ml", value: 200 },
      ],
      tint: "text-highlight-muted",
      onDecrease: () =>
        updateHotWaterVolume(Math.max(10, (workflow?.hotWaterData?.volume ?? 50) - 10)),
      onIncrease: () => updateHotWaterVolume((workflow?.hotWaterData?.volume ?? 50) + 10),
      onPresetClick: (value: number) => updateHotWaterVolume(value),
    },
  ] as const;
}

export function useDashboardShotSummary({
  recipeControls,
  snapshot,
  workflow,
}: {
  recipeControls: DashboardRecipeControls;
  snapshot: DashboardWorkflowControls["snapshot"];
  workflow: DashboardWorkflowControls["workflow"];
}): ReadonlyArray<DashboardShotSummaryItem> {
  const targetDose = workflow?.context?.targetDoseWeight;
  const targetYield = workflow?.context?.targetYield;

  return [
    { label: "Recipe", value: getDashboardActiveRecipe(workflow) },
    { label: "Dose", value: recipeControls.doseValue },
    { label: "Yield", value: recipeControls.drinkValue },
    { label: "Ratio", value: formatBrewRatio(targetDose, targetYield) },
    {
      label: "Brew",
      value: formatPrimaryNumber(snapshot?.mixTemperature, "°C", "87°C", 0),
    },
  ] satisfies ReadonlyArray<DashboardShotSummaryItem>;
}

export function getDashboardActiveRecipe(workflow: WorkflowRecord | null | undefined) {
  return workflow?.profile?.title ?? workflow?.name ?? "PSPH";
}
