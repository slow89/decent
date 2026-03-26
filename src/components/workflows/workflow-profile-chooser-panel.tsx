import { useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { joinValues, getProfileTitle } from "@/lib/workflow-utils";
import type { ProfileRecord, WorkflowProfile } from "@/rest/types";

import { WorkflowEmptyState } from "./workflow-empty-state";
import { WorkflowPanel } from "./workflow-panel";

export function WorkflowProfileChooserPanel({
  activeProfile,
  availableProfiles,
  isApplying,
  isImporting,
  isVisualizerReady,
  libraryStatus,
  onApplyProfile,
  onImportVisualizerProfile,
  onOpenFrames,
}: {
  activeProfile: WorkflowProfile | undefined;
  availableProfiles: ProfileRecord[];
  isApplying: boolean;
  isImporting: boolean;
  isVisualizerReady: boolean;
  libraryStatus: {
    message: string | null;
    tone: "error" | "success";
  };
  onApplyProfile: (record: ProfileRecord) => void;
  onImportVisualizerProfile: (shareCode: string) => Promise<void>;
  onOpenFrames: (profile: WorkflowProfile | undefined) => void;
}) {
  return (
    <WorkflowPanel
      className="md:flex md:h-full md:min-h-0 md:flex-col"
      contentClassName="md:flex md:min-h-0 md:flex-1"
      title="Choose Profile"
    >
      <div className="grid gap-2 md:min-h-0 md:flex-1 md:grid-rows-[auto_auto_minmax(0,1fr)]">
        <ProfileLibraryActions
          isImporting={isImporting}
          isVisualizerReady={isVisualizerReady}
          libraryStatus={libraryStatus}
          onImportVisualizerProfile={onImportVisualizerProfile}
        />
        <CurrentProfileRow
          onOpenFrames={() => onOpenFrames(activeProfile)}
          profile={activeProfile}
        />
        <div className="grid gap-1.5 md:min-h-0 md:overflow-hidden">
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Saved profiles
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
              title="Only the current profile is available"
            />
          )}
        </div>
      </div>
    </WorkflowPanel>
  );
}

function ProfileLibraryActions({
  isImporting,
  isVisualizerReady,
  libraryStatus,
  onImportVisualizerProfile,
}: {
  isImporting: boolean;
  isVisualizerReady: boolean;
  libraryStatus: {
    message: string | null;
    tone: "error" | "success";
  };
  onImportVisualizerProfile: (shareCode: string) => Promise<void>;
}) {
  const [shareCode, setShareCode] = useState("");
  const isImportDisabled = isImporting || !shareCode.trim() || !isVisualizerReady;

  async function handleVisualizerImport() {
    if (isImportDisabled) {
      return;
    }

    await onImportVisualizerProfile(shareCode.trim());
    setShareCode("");
  }

  return (
    <section className="rounded-[10px] border border-border bg-panel-subtle px-2.5 py-2.5 md:px-2 md:py-2">
      <div className="grid gap-2">
        <div>
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-highlight">
            Visualizer Import
          </p>
          <p className="mt-1 text-[0.7rem] leading-4 text-muted-foreground">
            Use a 4-digit share code.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="grid gap-1" htmlFor="visualizer-share-code">
            <span className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Share code
            </span>
            <Input
              autoCapitalize="characters"
              className="h-10 rounded-[10px] border-border bg-panel-strong font-mono text-[0.74rem] uppercase"
              id="visualizer-share-code"
              onChange={(event) => setShareCode(event.target.value)}
              placeholder="AB12"
              value={shareCode}
            />
          </label>
          <div className="flex items-end">
            <Button
              className="min-h-[40px] rounded-[10px] px-4 text-[0.66rem] uppercase tracking-[0.16em]"
              disabled={isImportDisabled}
              onClick={() => {
                void handleVisualizerImport();
              }}
              size="sm"
              type="button"
            >
              {isImporting ? "Importing" : "Import"}
            </Button>
          </div>
        </div>
      </div>

      {libraryStatus.message ? (
        <p
          className={cn(
            "mt-2 text-[0.72rem] leading-5",
            libraryStatus.tone === "error" ? "text-destructive" : "text-highlight",
          )}
        >
          {libraryStatus.message}
        </p>
      ) : !isVisualizerReady ? (
        <p className="mt-2 text-[0.72rem] leading-5 text-muted-foreground">
          Enable Visualizer in Setup.
        </p>
      ) : (
        <p className="mt-2 text-[0.72rem] leading-5 text-muted-foreground">
          Enter the share code and import.
        </p>
      )}
    </section>
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
    <div className="rounded-[10px] border border-border bg-panel-subtle px-2.5 py-2.5 md:px-2 md:py-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-highlight">
          Current profile
        </p>
        <span className="rounded-full border border-accent/35 bg-accent/12 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-accent">
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
          ? "border-border bg-panel-muted opacity-70"
          : "cursor-pointer border-border bg-panel-muted hover:border-highlight/35 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        isActive ? "border-highlight bg-primary/10" : null,
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
            <span className="rounded-full border border-highlight/35 bg-primary/12 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-highlight">
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
          className="mt-1 line-clamp-1 text-[0.74rem] leading-5 text-muted-foreground"
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
          : "border-highlight/30 bg-secondary/80 text-foreground hover:border-highlight/45 hover:bg-secondary",
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
