import type { FormEventHandler, ReactNode } from "react";

import { RecipePresetRow, RecipeValueControl } from "@/components/recipe/recipe-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RecipePreset } from "@/lib/recipe-utils";
import type { WorkflowRecord } from "@/rest/types";

import { WorkflowPanel } from "./workflow-panel";

export function WorkflowShotSetupPanel({
  dosePresets,
  drinkPresets,
  isUpdating,
  onDecreaseDose,
  onDecreaseDrink,
  onIncreaseDose,
  onIncreaseDrink,
  onSelectDosePreset,
  onSelectDrinkPreset,
  onSubmit,
  ratio,
  targetDose,
  targetYield,
  workflow,
}: {
  dosePresets: ReadonlyArray<RecipePreset>;
  drinkPresets: ReadonlyArray<RecipePreset>;
  isUpdating: boolean;
  onDecreaseDose: () => void;
  onDecreaseDrink: () => void;
  onIncreaseDose: () => void;
  onIncreaseDrink: () => void;
  onSelectDosePreset: (value: number) => void;
  onSelectDrinkPreset: (value: number) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  ratio: string;
  targetDose: number | null | undefined;
  targetYield: number | null | undefined;
  workflow: WorkflowRecord | undefined;
}) {
  return (
    <WorkflowPanel
      description="Name the workflow if needed, then set the dose, yield, grinder, and coffee details for the shot you are preparing."
      title="Shot Setup"
    >
      <form
        className="grid gap-3"
        key={JSON.stringify(workflow ?? null)}
        onSubmit={onSubmit}
      >
        <section className="rounded-[10px] border border-border bg-[#090a0c] px-2.5 py-2.5">
          <DoseYieldControlRow
            disabled={isUpdating}
            doseActivePresetValue={targetDose ?? 18}
            dosePresets={dosePresets}
            doseValue={targetDose == null ? "18g" : `${targetDose.toFixed(0)}g`}
            drinkActivePresetValue={targetDose && targetYield ? targetYield / targetDose : 2.0}
            drinkDetail={`(${ratio})`}
            drinkPresets={drinkPresets}
            drinkValue={targetYield == null ? "36g" : `${targetYield.toFixed(0)}g`}
            onDecreaseDose={onDecreaseDose}
            onDecreaseDrink={onDecreaseDrink}
            onIncreaseDose={onIncreaseDose}
            onIncreaseDrink={onIncreaseDrink}
            onSelectDosePreset={onSelectDosePreset}
            onSelectDrinkPreset={onSelectDrinkPreset}
          />
        </section>

        <section className="rounded-[10px] border border-border bg-[#090a0c] px-2.5 py-2.5">
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Workflow metadata
          </p>
          <div className="mt-2 grid gap-2.5 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.2fr)]">
            <Field label="Workflow name">
              <Input
                className="rounded-[10px] border-border bg-[#060709] font-mono"
                defaultValue={workflow?.name ?? ""}
                name="name"
              />
            </Field>
            <Field label="Description">
              <Input
                className="rounded-[10px] border-border bg-[#060709] font-mono"
                defaultValue={workflow?.description ?? ""}
                name="description"
              />
            </Field>
          </div>
        </section>

        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Grinder model">
            <Input
              className="rounded-[10px] border-border bg-[#090a0c] font-mono"
              defaultValue={workflow?.context?.grinderModel ?? ""}
              name="grinderModel"
            />
          </Field>
          <Field label="Grinder setting">
            <Input
              className="rounded-[10px] border-border bg-[#090a0c] font-mono"
              defaultValue={workflow?.context?.grinderSetting ?? ""}
              name="grinderSetting"
            />
          </Field>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          <Field label="Coffee name">
            <Input
              className="rounded-[10px] border-border bg-[#090a0c] font-mono"
              defaultValue={workflow?.context?.coffeeName ?? ""}
              name="coffeeName"
            />
          </Field>
          <Field label="Roaster">
            <Input
              className="rounded-[10px] border-border bg-[#090a0c] font-mono"
              defaultValue={workflow?.context?.coffeeRoaster ?? ""}
              name="coffeeRoaster"
            />
          </Field>
        </div>

        <Button
          className="min-h-[42px] rounded-[10px] font-mono text-[0.74rem] uppercase tracking-[0.18em]"
          disabled={isUpdating}
          type="submit"
        >
          {isUpdating ? "Saving" : "Save shot setup"}
        </Button>
      </form>
    </WorkflowPanel>
  );
}

function DoseYieldControlRow({
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
}: {
  disabled: boolean;
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
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#d99826]">
          Recipe
        </p>
        <p className="min-w-[56px] text-right font-mono text-[0.8rem] font-medium text-muted-foreground">
          {drinkDetail}
        </p>
      </div>

      <div className="mt-2 space-y-2">
        <RecipeControlRow
          activePresetValue={doseActivePresetValue}
          disabled={disabled}
          label="Dose"
          onDecrease={onDecreaseDose}
          onIncrease={onIncreaseDose}
          onPresetClick={onSelectDosePreset}
          presets={dosePresets}
          value={doseValue}
        />

        <RecipeControlRow
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
    </div>
  );
}

function RecipeControlRow({
  activePresetValue,
  disabled,
  label,
  onDecrease,
  onIncrease,
  onPresetClick,
  presets,
  value,
}: {
  activePresetValue: number;
  disabled: boolean;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onPresetClick: (value: number) => void;
  presets: ReadonlyArray<RecipePreset>;
  value: string;
}) {
  return (
    <div className="grid gap-1.5 xl:grid-cols-[48px_220px_minmax(0,1fr)] xl:items-center">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground xl:pt-0.5">
        {label}
      </p>
      <RecipeValueControl
        disabled={disabled}
        label={label}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        value={value}
      />
      <RecipePresetRow
        activePresetValue={activePresetValue}
        className="xl:h-full xl:content-center"
        disabled={disabled}
        itemClassName="xl:px-1.5"
        onPresetClick={onPresetClick}
        presets={presets}
      />
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
