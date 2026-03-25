import type { FormEvent } from "react";
import { useState } from "react";

import { FramePreviewOverlay } from "@/components/workflows/frame-preview-overlay";
import { WorkflowProfileChooserPanel } from "@/components/workflows/workflow-profile-chooser-panel";
import { WorkflowShotSetupPanel } from "@/components/workflows/workflow-shot-setup-panel";
import { formatBrewRatio, roundValue } from "@/lib/recipe-utils";
import { getProfileFingerprint, getProfileTitle, readString } from "@/lib/workflow-utils";
import {
  useExportProfilesMutation,
  useImportProfilesMutation,
  useProfilesQuery,
  useRestoreDefaultProfileMutation,
  useUpdateWorkflowMutation,
  useWorkflowQuery,
} from "@/rest/queries";
import type {
  ProfileRecord,
  WorkflowContext,
  WorkflowProfile,
} from "@/rest/types";
import { profileRecordListSchema } from "@/rest/types";

export function WorkflowsPage() {
  const workflowQuery = useWorkflowQuery();
  const profilesQuery = useProfilesQuery();
  const updateWorkflowMutation = useUpdateWorkflowMutation();
  const importProfilesMutation = useImportProfilesMutation();
  const exportProfilesMutation = useExportProfilesMutation();
  const restoreDefaultProfileMutation = useRestoreDefaultProfileMutation();
  const [framePreviewProfile, setFramePreviewProfile] = useState<WorkflowProfile | null>(null);
  const [profileLibraryStatus, setProfileLibraryStatus] = useState<{
    message: string | null;
    tone: "error" | "success";
  }>({
    message: null,
    tone: "success",
  });

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
  const ratio = formatBrewRatio(targetDose, targetYield);
  const isUpdating = updateWorkflowMutation.isPending;
  const isImportingProfiles = importProfilesMutation.isPending;
  const isExportingProfiles = exportProfilesMutation.isPending;
  const isRestoringDefaultProfile = restoreDefaultProfileMutation.isPending;

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

  function setProfileLibraryError(message: string) {
    setProfileLibraryStatus({
      message,
      tone: "error",
    });
  }

  function setProfileLibrarySuccess(message: string) {
    setProfileLibraryStatus({
      message,
      tone: "success",
    });
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

  async function handleImportProfiles(file: File) {
    try {
      const parsedPayload = JSON.parse(await file.text()) as unknown;
      const parsedProfiles = profileRecordListSchema.safeParse(parsedPayload);

      if (!parsedProfiles.success) {
        setProfileLibraryError("Import file must be a JSON array of bridge profile records.");
        return;
      }

      const result = await importProfilesMutation.mutateAsync(parsedProfiles.data);
      const errorSummary = result.errors.length ? ` ${result.errors.join(" ")}` : "";

      setProfileLibrarySuccess(
        `Imported ${result.imported}, skipped ${result.skipped}, failed ${result.failed}.${errorSummary}`,
      );
    } catch (error) {
      setProfileLibraryError(
        error instanceof Error ? error.message : "Unable to import the selected profile library.",
      );
    }
  }

  async function handleExportProfiles() {
    try {
      const profiles = await exportProfilesMutation.mutateAsync();
      const blob = new Blob([JSON.stringify(profiles, null, 2)], {
        type: "application/json",
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);

      anchor.href = objectUrl;
      anchor.download = `profiles_export_${stamp}.json`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);

      setProfileLibrarySuccess(`Exported ${profiles.length} profiles to a JSON download.`);
    } catch (error) {
      setProfileLibraryError(
        error instanceof Error ? error.message : "Unable to export the current profile library.",
      );
    }
  }

  async function handleRestoreDefaultProfile(filename: string) {
    try {
      const restoredProfile = await restoreDefaultProfileMutation.mutateAsync(filename);
      setProfileLibrarySuccess(
        `Restored ${getProfileTitle(restoredProfile.profile)} from ${filename}.`,
      );
    } catch (error) {
      setProfileLibraryError(
        error instanceof Error ? error.message : "Unable to restore the requested default profile.",
      );
    }
  }

  return (
    <div>
      <div className="panel min-h-[calc(100vh-var(--app-footer-height))] overflow-hidden rounded-none border-x-0 border-t-0 bg-shell md:flex md:h-[calc(100vh-var(--app-footer-height))] md:flex-col">
        <section className="px-3 py-3 md:flex-1 md:min-h-0 md:px-4">
          <div className="grid gap-3 md:h-full md:grid-cols-[minmax(290px,320px)_minmax(0,1fr)] md:items-stretch xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
            <WorkflowProfileChooserPanel
              activeProfile={activeProfile}
              availableProfiles={availableProfiles}
              isApplying={isUpdating}
              isExporting={isExportingProfiles}
              isImporting={isImportingProfiles}
              isRestoringDefault={isRestoringDefaultProfile}
              libraryStatus={profileLibraryStatus}
              onApplyProfile={applyProfile}
              onExportProfiles={handleExportProfiles}
              onImportProfiles={handleImportProfiles}
              onOpenFrames={openFramePreview}
              onRestoreDefaultProfile={handleRestoreDefaultProfile}
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
