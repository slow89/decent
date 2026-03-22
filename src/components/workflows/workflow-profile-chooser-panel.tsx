import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { joinValues, getProfileTitle } from "@/lib/workflow-utils";
import type { ProfileRecord, WorkflowProfile } from "@/rest/types";

import { WorkflowEmptyState } from "./workflow-empty-state";
import { WorkflowPanel } from "./workflow-panel";

export function WorkflowProfileChooserPanel({
  activeProfile,
  availableProfiles,
  isApplying,
  onApplyProfile,
  onOpenFrames,
}: {
  activeProfile: WorkflowProfile | undefined;
  availableProfiles: ProfileRecord[];
  isApplying: boolean;
  onApplyProfile: (record: ProfileRecord) => void;
  onOpenFrames: (profile: WorkflowProfile | undefined) => void;
}) {
  return (
    <WorkflowPanel
      description="Keep the current profile visible, then swap to another saved profile when you want a different recipe."
      title="Choose Profile"
    >
      <div className="grid gap-2.5">
        <CurrentProfileRow
          onOpenFrames={() => onOpenFrames(activeProfile)}
          profile={activeProfile}
        />
        <div className="grid gap-1.5">
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Available profiles
          </p>
          {availableProfiles.length ? (
            <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {availableProfiles.map((record) => (
                <ProfileCard
                  isActive={false}
                  isApplying={isApplying}
                  key={record.id}
                  onApply={() => onApplyProfile(record)}
                  onOpenFrames={() => onOpenFrames(record.profile)}
                  record={record}
                />
              ))}
            </div>
          ) : (
            <WorkflowEmptyState
              body="No other visible profiles came back from the bridge."
              title="Only the applied profile is available"
            />
          )}
        </div>
      </div>
    </WorkflowPanel>
  );
}

function CurrentProfileRow({
  onOpenFrames,
  profile,
}: {
  onOpenFrames: () => void;
  profile: WorkflowProfile | undefined;
}) {
  return (
    <div className="rounded-[10px] border border-[#2a2112] bg-[#0f0c08] px-2.5 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[#d0a954]">
          Applied now
        </p>
        <span className="rounded-full border border-[#215436] bg-[#0d1d14] px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7ce0a7]">
          Active
        </span>
      </div>
      <p className="mt-2 font-display text-[1.15rem] leading-none text-foreground">
        {getProfileTitle(profile)}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted-foreground">
          {joinValues([
            profile?.author ?? "Unknown author",
            profile?.beverage_type ?? "espresso",
          ])}
        </p>
        <FrameCountButton
          count={profile?.steps?.length ?? 0}
          disabled={!profile?.steps?.length}
          onClick={onOpenFrames}
        />
      </div>
    </div>
  );
}

function ProfileCard({
  isActive,
  isApplying,
  onApply,
  onOpenFrames,
  record,
}: {
  isActive: boolean;
  isApplying: boolean;
  onApply: () => void;
  onOpenFrames: () => void;
  record: ProfileRecord;
}) {
  const profile = record.profile;

  return (
    <div
      className={cn(
        "rounded-[10px] border px-2.5 py-2.5 transition",
        isActive ? "border-[#d99826] bg-[#151008]" : "border-border bg-[#090a0c]",
      )}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-[1rem] leading-none text-foreground">
              {getProfileTitle(profile)}
            </p>
            {record.isDefault ? (
              <span className="rounded-full border border-[#4e3a16] bg-[#1c160b] px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#f0be57]">
                Default
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted-foreground">
              {joinValues([
                profile.author ?? "Unknown author",
                profile.beverage_type ?? "espresso",
              ])}
            </p>
            <FrameCountButton
              count={profile.steps?.length ?? 0}
              disabled={!profile.steps?.length}
              onClick={onOpenFrames}
            />
          </div>
          <p
            className="mt-1.5 truncate text-[0.76rem] leading-5 text-muted-foreground"
            title={profile.notes?.trim() || "No profile notes from the bridge."}
          >
            {profile.notes?.trim() || "No profile notes from the bridge."}
          </p>
        </div>

        <Button
          className="min-h-[34px] rounded-[9px] px-3 font-mono text-[0.68rem] uppercase tracking-[0.18em]"
          disabled={isApplying || isActive}
          onClick={onApply}
          size="sm"
          variant="default"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

function FrameCountButton({
  count,
  disabled,
  onClick,
}: {
  count: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-[7px] border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition",
        disabled
          ? "border-border/50 text-muted-foreground/60"
          : "border-[#27415f] bg-[#132030] text-foreground hover:border-[#365b84] hover:bg-[#18283a]",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {count} frames
    </button>
  );
}
