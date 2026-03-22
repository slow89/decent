import type { ReactNode } from "react";

import { Minus, Plus } from "lucide-react";

import { isPresetActive, type RecipePreset } from "@/lib/recipe-utils";
import { cn } from "@/lib/utils";

export function RecipeControlButton({
  ariaLabel,
  children,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-[#2d2110] bg-[#08090b] text-foreground transition hover:bg-[#111317] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function RecipeValueControl({
  disabled,
  label,
  onDecrease,
  onIncrease,
  value,
}: {
  disabled: boolean;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[26px_minmax(0,1fr)_26px] items-center gap-1 rounded-[8px] border border-border/80 bg-[#0b0c0f] px-1 py-1">
      <RecipeControlButton
        ariaLabel={`Decrease ${label}`}
        disabled={disabled}
        onClick={onDecrease}
      >
        <Minus className="size-3.5" />
      </RecipeControlButton>

      <div className="min-w-0 text-center">
        <p className="font-mono text-[0.88rem] font-semibold text-foreground">{value}</p>
      </div>

      <RecipeControlButton
        ariaLabel={`Increase ${label}`}
        disabled={disabled}
        onClick={onIncrease}
      >
        <Plus className="size-3.5" />
      </RecipeControlButton>
    </div>
  );
}

export function RecipePresetRow({
  activePresetValue,
  align = "center",
  className,
  disabled,
  itemClassName,
  onPresetClick,
  presets,
}: {
  activePresetValue: number;
  align?: "center" | "left";
  className?: string;
  disabled: boolean;
  itemClassName?: string;
  onPresetClick: (value: number) => void;
  presets: ReadonlyArray<RecipePreset>;
}) {
  return (
    <div className={cn("grid grid-cols-4 gap-1 text-[0.72rem] font-medium text-muted-foreground", className)}>
      {presets.map((preset) => (
        <button
          key={preset.label}
          className={cn(
            "rounded-[7px] border border-transparent font-mono transition",
            align === "left" ? "px-1.5 py-1 text-left" : "px-1 py-1 text-center",
            isPresetActive(activePresetValue, preset.value)
              ? "border-[#36547a] bg-[#16253a] text-foreground"
              : "hover:border-[#1f3550] hover:bg-[#101824] hover:text-foreground",
            itemClassName,
          )}
          disabled={disabled}
          onClick={() => onPresetClick(preset.value)}
          type="button"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
