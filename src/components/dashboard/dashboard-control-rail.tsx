import {
  RecipeControlButton,
  RecipePresetRow,
  RecipeValueControl,
} from "@/components/recipe/recipe-controls";
import { Minus, Plus } from "lucide-react";
import type { RecipePreset } from "@/lib/recipe-utils";
import { cn } from "@/lib/utils";

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

export function DashboardControlRail({
  controlRows,
  recipeControls,
  workflowDisabled,
}: {
  controlRows: ReadonlyArray<DashboardControlRow>;
  recipeControls: DashboardRecipeControls;
  workflowDisabled: boolean;
}) {
  return (
    <aside className="border-b border-border md:min-h-0 md:overflow-y-auto md:overscroll-contain md:border-b-0 md:border-r">
      <DoseDrinkControlRow disabled={workflowDisabled} {...recipeControls} />
      {controlRows.map((row) => (
        <ControlRailRow
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
    </aside>
  );
}

function DoseDrinkControlRow({
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
    <div className="border-b border-border px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-highlight-muted">
          Recipe
        </p>
        <p className="min-w-[56px] text-right font-mono text-[0.8rem] font-medium text-muted-foreground">
          {drinkDetail}
        </p>
      </div>

      <div className="mt-2 space-y-2">
        <div className="space-y-1">
          <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-2">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Dose
            </p>
            <RecipeValueControl
              disabled={disabled}
              label="Dose"
              onDecrease={onDecreaseDose}
              onIncrease={onIncreaseDose}
              value={doseValue}
            />
          </div>
          <RecipePresetRow
            activePresetValue={doseActivePresetValue}
            disabled={disabled}
            onPresetClick={onSelectDosePreset}
            presets={dosePresets}
          />
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-2">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Yield
            </p>
            <RecipeValueControl
              disabled={disabled}
              label="Yield"
              onDecrease={onDecreaseDrink}
              onIncrease={onIncreaseDrink}
              value={drinkValue}
            />
          </div>
          <RecipePresetRow
            activePresetValue={drinkActivePresetValue}
            disabled={disabled}
            onPresetClick={onSelectDrinkPreset}
            presets={drinkPresets}
          />
        </div>
      </div>
    </div>
  );
}

function ControlRailRow({
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
    <div className="border-b border-border px-3 py-3 last:border-b-0">
      <div className="grid grid-cols-[52px_minmax(0,1fr)] items-start gap-3">
        <p
          className={cn(
            "pt-2 text-[0.74rem] font-semibold uppercase tracking-[0.16em]",
            tint,
          )}
        >
          {label}
        </p>

        <RailValueControl
          detail={detail}
          disabled={disabled}
          label={label}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
          value={value}
        />
      </div>

      <RecipePresetRow
        activePresetValue={activePresetValue}
        align="left"
        className="mt-2 gap-1.5"
        disabled={disabled}
        onPresetClick={onPresetClick}
        presets={presets}
      />
    </div>
  );
}

function RailValueControl({
  detail,
  disabled,
  label,
  onDecrease,
  onIncrease,
  value,
}: {
  detail?: string;
  disabled: boolean;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2">
      <RecipeControlButton
        ariaLabel={`Decrease ${label}`}
        disabled={disabled}
        onClick={onDecrease}
      >
        <Minus className="size-4" />
      </RecipeControlButton>

      <div className="min-w-0 text-center">
        <p className="font-mono text-[0.92rem] font-semibold text-foreground">{value}</p>
        {detail ? (
          <p className="mt-0.5 font-mono text-[0.72rem] text-muted-foreground">{detail}</p>
        ) : null}
      </div>

      <RecipeControlButton
        ariaLabel={`Increase ${label}`}
        disabled={disabled}
        onClick={onIncrease}
      >
        <Plus className="size-4" />
      </RecipeControlButton>
    </div>
  );
}
