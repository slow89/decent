import { DashboardControlRail, type DashboardControlRow, type DashboardRecipeControls } from "@/components/dashboard/dashboard-control-rail";
import { DashboardTabletPrepBoard } from "@/components/dashboard/dashboard-tablet-prep-board";
import {
  DashboardTabletShotSummary,
  type DashboardShotSummaryItem,
} from "@/components/dashboard/dashboard-tablet-shot-summary";
import { TelemetryChart } from "@/components/telemetry-chart";
import type { TelemetrySample } from "@/lib/telemetry";

export function DashboardWorkspace({
  controlRows,
  isShotActive,
  recipeControls,
  shotSummaryItems,
  telemetry,
  workflowDisabled,
}: {
  controlRows: ReadonlyArray<DashboardControlRow>;
  isShotActive: boolean;
  recipeControls: DashboardRecipeControls;
  shotSummaryItems: ReadonlyArray<DashboardShotSummaryItem>;
  telemetry: TelemetrySample[];
  workflowDisabled: boolean;
}) {
  return (
    <section className="min-h-0 flex flex-1 flex-col">
      <div
        className="hidden h-full min-h-0 flex-1 xl:grid xl:grid-cols-[296px_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)] xl:overflow-hidden"
        data-testid="dashboard-desktop-workspace"
      >
        <DashboardDesktopWorkspace
          controlRows={controlRows}
          recipeControls={recipeControls}
          telemetry={telemetry}
          workflowDisabled={workflowDisabled}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col xl:hidden">
        {isShotActive ? (
          <DashboardTabletShotWorkspace
            shotSummaryItems={shotSummaryItems}
            telemetry={telemetry}
          />
        ) : (
          <DashboardTabletPrepBoard
            controlRows={controlRows}
            recipeControls={recipeControls}
            workflowDisabled={workflowDisabled}
          />
        )}
      </div>
    </section>
  );
}

function DashboardDesktopWorkspace({
  controlRows,
  recipeControls,
  telemetry,
  workflowDisabled,
}: {
  controlRows: ReadonlyArray<DashboardControlRow>;
  recipeControls: DashboardRecipeControls;
  telemetry: TelemetrySample[];
  workflowDisabled: boolean;
}) {
  return (
    <>
      <DashboardControlRail
        controlRows={controlRows}
        recipeControls={recipeControls}
        workflowDisabled={workflowDisabled}
      />

      <div className="min-w-0 flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden px-4 py-4">
          <TelemetryChart
            className="h-full rounded-[18px] border-0 bg-transparent p-0 shadow-none"
            data={telemetry}
            layout="desktop"
          />
        </div>
      </div>
    </>
  );
}

function DashboardTabletShotWorkspace({
  shotSummaryItems,
  telemetry,
}: {
  shotSummaryItems: ReadonlyArray<DashboardShotSummaryItem>;
  telemetry: TelemetrySample[];
}) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-2 py-2 md:px-3 md:py-3"
      data-testid="dashboard-tablet-shot-workspace"
    >
      <DashboardTabletShotSummary items={shotSummaryItems} />

      <div className="mt-2.5 min-h-0 flex-1 overflow-hidden">
        <TelemetryChart
          className="h-full rounded-[18px] border-0 bg-transparent p-0 shadow-none"
          data={telemetry}
          layout="tablet"
        />
      </div>
    </div>
  );
}
