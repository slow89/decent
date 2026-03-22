import type { FormEvent } from "react";
import { useState } from "react";

import { FramePreviewOverlay } from "@/components/workflows/frame-preview-overlay";
import { WorkflowProfileChooserPanel } from "@/components/workflows/workflow-profile-chooser-panel";
import { WorkflowShotSetupPanel } from "@/components/workflows/workflow-shot-setup-panel";
import { roundValue } from "@/lib/recipe-utils";
import { getProfileFingerprint, getProfileTitle, readString } from "@/lib/workflow-utils";
import {
  useProfilesQuery,
  useUpdateWorkflowMutation,
  useWorkflowQuery,
} from "@/rest/queries";
import type {
  ProfileRecord,
  WorkflowContext,
  WorkflowProfile,
} from "@/rest/types";

export function WorkflowsPage() {
  const workflowQuery = useWorkflowQuery();
  const profilesQuery = useProfilesQuery();
  const updateWorkflowMutation = useUpdateWorkflowMutation();
  const [framePreviewProfile, setFramePreviewProfile] = useState<WorkflowProfile | null>(null);

  const workflow = workflowQuery.data;
  const activeProfile = workflow?.profile;
  const activeProfileKey = getProfileFingerprint(activeProfile);
  const visibleProfiles = (profilesQuery.data ?? [])
    .filter((profile) => profile.visibility == null || profile.visibility === "visible")
    .sort((left, right) => {
      const defaultRank = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault));

      if (defaultRank !== 0) {
        return defaultRank;
      }

      return getProfileTitle(left.profile).localeCompare(getProfileTitle(right.profile));
    });
  const availableProfiles = visibleProfiles.filter(
    (profile) => getProfileFingerprint(profile.profile) !== activeProfileKey,
  );
  const targetDose = workflow?.context?.targetDoseWeight;
  const targetYield = workflow?.context?.targetYield;
  const ratio =
    targetDose && targetYield ? `${(targetYield / targetDose).toFixed(1)}:1` : "1:2.0";
  const isUpdating = updateWorkflowMutation.isPending;

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

  function updateWorkflow(patch: Record<string, unknown>) {
    updateWorkflowMutation.mutate(patch);
  }

  function applyProfile(record: ProfileRecord) {
    updateWorkflow({
      profile: record.profile,
    });
  }

  function openFramePreview(profile: WorkflowProfile | undefined) {
    if (!profile?.steps?.length) {
      return;
    }

    setFramePreviewProfile(profile);
  }

  function closeFramePreview() {
    setFramePreviewProfile(null);
  }

  function updateDose(nextDose: number) {
    updateWorkflow({
      context: {
        targetDoseWeight: roundValue(nextDose, 0),
      },
    });
  }

  function updateYield(nextYield: number) {
    updateWorkflow({
      context: {
        targetYield: roundValue(nextYield, 0),
      },
    });
  }

  function handleShotSetupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    updateWorkflow({
      name: readString(formData, "name", workflow?.name ?? "Workflow"),
      description: readString(formData, "description", workflow?.description ?? ""),
      context: {
        grinderModel: readString(formData, "grinderModel", workflow?.context?.grinderModel ?? ""),
        grinderSetting: readString(
          formData,
          "grinderSetting",
          workflow?.context?.grinderSetting ?? "",
        ),
        coffeeName: readString(formData, "coffeeName", workflow?.context?.coffeeName ?? ""),
        coffeeRoaster: readString(
          formData,
          "coffeeRoaster",
          workflow?.context?.coffeeRoaster ?? "",
        ),
      } satisfies Partial<WorkflowContext>,
    });
  }

  return (
    <div>
      <div className="panel min-h-[calc(100svh-6.5rem)] overflow-hidden rounded-none border-x-0 border-t-0 bg-[#08090b]/98">
        <section className="px-3 py-3 md:px-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <WorkflowProfileChooserPanel
              activeProfile={activeProfile}
              availableProfiles={availableProfiles}
              isApplying={isUpdating}
              onApplyProfile={applyProfile}
              onOpenFrames={openFramePreview}
            />

            <WorkflowShotSetupPanel
              dosePresets={dosePresets}
              drinkPresets={drinkPresets}
              isUpdating={isUpdating}
              onDecreaseDose={() => updateDose(Math.max(8, Math.round((targetDose ?? 18) - 1)))}
              onDecreaseDrink={() =>
                updateYield(Math.max(1, Math.round((targetYield ?? 36) - 1)))
              }
              onIncreaseDose={() => updateDose(Math.round((targetDose ?? 18) + 1))}
              onIncreaseDrink={() => updateYield(Math.round((targetYield ?? 36) + 1))}
              onSelectDosePreset={updateDose}
              onSelectDrinkPreset={(value) => updateYield((targetDose ?? 18) * value)}
              onSubmit={handleShotSetupSubmit}
              ratio={ratio}
              targetDose={targetDose}
              targetYield={targetYield}
              workflow={workflow}
            />
          </div>
        </section>
      </div>

      {framePreviewProfile ? (
        <FramePreviewOverlay
          key={getProfileFingerprint(framePreviewProfile)}
          onClose={closeFramePreview}
          profile={framePreviewProfile}
        />
      ) : null}
    </div>
  );
}
