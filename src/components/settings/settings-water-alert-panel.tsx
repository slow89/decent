import { useState, type ChangeEvent, type KeyboardEvent } from "react";

import {
  ControlBlock,
  SettingsSection,
} from "@/components/settings/settings-shell";
import { useWaterAlertStore } from "@/stores/water-alert-store";

export function SettingsWaterAlertPanel() {
  const alertThreshold = useWaterAlertStore((state) => state.alertThreshold);
  const setAlertThreshold = useWaterAlertStore((state) => state.setAlertThreshold);
  const [draft, setDraft] = useState(alertThreshold);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setDraft(Number(event.target.value));
  }

  function commit(value = draft) {
    setAlertThreshold(value);
  }

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") {
      commit();
    }
  }

  return (
    <SettingsSection
      description="Low water warning overlay"
      title="Water Alert"
    >
      <div className="grid gap-2">
        <ControlBlock
          description="Show refill reminder at this level"
          label="Alert threshold"
          value={alertThreshold === 0 ? "Off" : `${alertThreshold}%`}
        >
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[0.46rem] uppercase tracking-[0.08em] text-muted-foreground/70">
              Off
            </span>
            <input
              aria-label="Water alert threshold"
              className="h-1.5 w-full cursor-pointer accent-[#d0a954]"
              max={60}
              min={0}
              onBlur={() => commit()}
              onChange={handleChange}
              onKeyUp={handleKeyUp}
              onPointerUp={() => commit()}
              step={5}
              type="range"
              value={draft}
            />
            <span className="font-mono text-[0.46rem] uppercase tracking-[0.08em] text-muted-foreground/70">
              60%
            </span>
          </div>
        </ControlBlock>
      </div>
    </SettingsSection>
  );
}
