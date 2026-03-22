import type { KeyboardEvent } from "react";

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
      className="md:flex md:h-full md:min-h-0 md:flex-col"
      contentClassName="md:flex md:min-h-0 md:flex-1"
      description="Keep the current profile visible, then swap to another saved profile when you want a different recipe."
      title="Choose Profile"
    >
      <div className="grid gap-2.5 md:min-h-0 md:flex-1 md:grid-rows-[auto_minmax(0,1fr)]">
        <CurrentProfileRow
          onOpenFrames={() => onOpenFrames(activeProfile)}
          profile={activeProfile}
        />
        <div className="grid gap-1.5 md:min-h-0 md:overflow-hidden">
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Available profiles
          </p>
          {availableProfiles.length ? (
            <div className="grid max-h-[420px] gap-1.5 overflow-y-auto overscroll-contain pr-1 md:max-h-none md:min-h-0 md:grid-cols-1 xl:gap-2">
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
    <div className="rounded-[10px] border border-[#2a2112] bg-[#0f0c08] px-2.5 py-2.5 md:px-2 md:py-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[#d0a954]">
          Applied now
        </p>
        <span className="rounded-full border border-[#215436] bg-[#0d1d14] px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7ce0a7]">
          Active
        </span>
      </div>
      <p className="mt-2 font-mono text-[1.15rem] font-medium leading-none tracking-[0.02em] text-foreground">
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
  const isDisabled = isApplying || isActive;

  function handleApply() {
    if (isDisabled) {
      return;
    }

    onApply();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isDisabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onApply();
    }
  }

  return (
    <div
      aria-disabled={isDisabled}
      className={cn(
        "rounded-[10px] border px-2.5 py-2.5 transition md:px-2 md:py-2",
        isDisabled
          ? "border-border bg-[#090a0c] opacity-70"
          : "cursor-pointer border-border bg-[#090a0c] hover:border-[#4c3914] hover:bg-[#0d0f12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        isActive ? "border-[#d99826] bg-[#151008]" : null,
      )}
      onClick={handleApply}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[1rem] font-medium leading-none tracking-[0.02em] text-foreground">
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
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      type="button"
    >
      {count} frames
    </button>
  );
}
