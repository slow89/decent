import { RecipePresetRow, RecipeValueControl } from "@/components/recipe/recipe-controls";
import { DashboardTabletPrepStatus } from "@/components/dashboard/dashboard-tablet-prep-status";
import type {
  DashboardControlRow,
  DashboardRecipeControls,
} from "@/components/dashboard/dashboard-view-model";
import type { DashboardPrepStatus } from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";

export function DashboardTabletPrepBoard({
  controlRows,
  prepStatus,
  recipeControls,
  workflowDisabled,
}: {
  controlRows: ReadonlyArray<DashboardControlRow>;
  prepStatus: DashboardPrepStatus;
  recipeControls: DashboardRecipeControls;
  workflowDisabled: boolean;
}) {
  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto px-2 py-2 md:px-3 md:py-3"
      data-testid="dashboard-tablet-prep-board"
    >
      <div className="space-y-3">
        <DashboardTabletPrepStatus status={prepStatus} />

        <div className="grid gap-3 md:grid-cols-2">
          <DashboardTabletRecipeCard
            disabled={workflowDisabled}
            {...recipeControls}
          />
          {controlRows.map((row) => (
            <DashboardTabletControlCard
              activePresetValue={row.activePresetValue}
              detail={row.detail}
              disabled={workflowDisabled}
              key={row.label}
              label={row.label}
              onDecrease={row.onDecrease}
              onIncrease={row.onIncrease}
              onPresetClick={row.onPresetClick}
              presets={row.presets}
              tint={row.tint}
              value={row.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardTabletRecipeCard({
  disabled,
  doseActivePresetValue,
  dosePresets,
  doseValue,
  drinkActivePresetValue,
  drinkDetail,
  drinkPresets,
  drinkValue,
  onDecreaseDose,
  onDecreaseDrink,
  onIncreaseDose,
  onIncreaseDrink,
  onSelectDosePreset,
  onSelectDrinkPreset,
}: DashboardRecipeControls & { disabled: boolean }) {
  return (
    <section className="rounded-[22px] border border-border bg-panel p-3 md:col-span-2 md:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-highlight-muted md:text-[0.8rem]">
          Recipe
        </p>
        <p className="font-mono text-[0.8rem] font-medium text-muted-foreground md:text-[0.86rem]">
          {drinkDetail}
        </p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <DashboardTabletAdjustSection
          activePresetValue={doseActivePresetValue}
          disabled={disabled}
          label="Dose"
          onDecrease={onDecreaseDose}
          onIncrease={onIncreaseDose}
          onPresetClick={onSelectDosePreset}
          presets={dosePresets}
          value={doseValue}
        />
        <DashboardTabletAdjustSection
          activePresetValue={drinkActivePresetValue}
          disabled={disabled}
          label="Yield"
          onDecrease={onDecreaseDrink}
          onIncrease={onIncreaseDrink}
          onPresetClick={onSelectDrinkPreset}
          presets={drinkPresets}
          value={drinkValue}
        />
      </div>
    </section>
  );
}

function DashboardTabletControlCard({
  activePresetValue,
  detail,
  disabled,
  label,
  onDecrease,
  onIncrease,
  onPresetClick,
  presets,
  tint,
  value,
}: DashboardControlRow & { disabled: boolean }) {
  return (
    <section className="rounded-[22px] border border-border bg-panel p-3 md:p-4">
      <DashboardTabletAdjustSection
        activePresetValue={activePresetValue}
        detail={detail}
        disabled={disabled}
        label={label}
        labelClassName={tint}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onPresetClick={onPresetClick}
        presets={presets}
        value={value}
      />
    </section>
  );
}

function DashboardTabletAdjustSection({
  activePresetValue,
  detail,
  disabled,
  label,
  labelClassName,
  onDecrease,
  onIncrease,
  onPresetClick,
  presets,
  value,
}: {
  activePresetValue: number;
  detail?: string;
  disabled: boolean;
  label: string;
  labelClassName?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onPresetClick: (value: number) => void;
  presets: DashboardControlRow["presets"];
  value: string;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-[0.76rem]",
            labelClassName,
          )}
        >
          {label}
        </p>
        {detail ? (
          <p className="font-mono text-[0.72rem] text-muted-foreground md:text-[0.76rem]">
            {detail}
          </p>
        ) : null}
      </div>

      <RecipeValueControl
        buttonClassName="h-10 w-10 rounded-[11px] md:h-11 md:w-11"
        className="mt-3 grid-cols-[40px_minmax(0,1fr)_40px] gap-2 rounded-[14px] px-2 py-2 md:grid-cols-[44px_minmax(0,1fr)_44px]"
        disabled={disabled}
        iconClassName="size-4"
        label={label}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        value={value}
        valueClassName="text-[1.05rem] md:text-[1.12rem]"
      />

      <RecipePresetRow
        activePresetValue={activePresetValue}
        className="mt-2.5 gap-2 text-[0.76rem] md:text-[0.8rem]"
        disabled={disabled}
        itemClassName="rounded-[11px] px-2 py-1.5"
        onPresetClick={onPresetClick}
        presets={presets}
      />
    </div>
  );
}
