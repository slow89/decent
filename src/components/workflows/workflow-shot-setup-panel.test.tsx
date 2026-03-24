import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorkflowShotSetupPanel } from "./workflow-shot-setup-panel";

describe("WorkflowShotSetupPanel", () => {
  it("renders dose and yield controls in a compact inline row", () => {
    render(
      <WorkflowShotSetupPanel
        dosePresets={[
          { label: "16g", value: 16 },
          { label: "18g", value: 18 },
          { label: "20g", value: 20 },
          { label: "22g", value: 22 },
        ]}
        drinkPresets={[
          { label: "1:1.5", value: 1.5 },
          { label: "1:2.0", value: 2.0 },
          { label: "1:2.5", value: 2.5 },
          { label: "1:3.0", value: 3.0 },
        ]}
        isUpdating={false}
        onDecreaseDose={vi.fn()}
        onDecreaseDrink={vi.fn()}
        onIncreaseDose={vi.fn()}
        onIncreaseDrink={vi.fn()}
        onSelectDosePreset={vi.fn()}
        onSelectDrinkPreset={vi.fn()}
        onSubmit={vi.fn()}
        ratio="1:2.0"
        targetDose={18}
        targetYield={36}
        workflow={{
          context: {
            coffeeName: "Sweet Bloom",
            coffeeRoaster: "Passenger",
            grinderModel: "Lagom Mini",
            grinderSetting: "4.2",
          },
          description: "Dial-in",
          name: "Morning spro",
        }}
      />,
    );

    const doseRow = screen.getByTestId("workflow-recipe-control-dose");
    const yieldRow = screen.getByTestId("workflow-recipe-control-yield");

    expect(doseRow.className).toContain(
      "[grid-template-columns:42px_minmax(104px,auto)_minmax(0,1fr)]",
    );
    expect(yieldRow.className).toContain(
      "[grid-template-columns:42px_minmax(104px,auto)_minmax(0,1fr)]",
    );

    expect(within(doseRow).getByRole("button", { name: "Decrease Dose" })).toBeInTheDocument();
    expect(within(doseRow).getByRole("button", { name: "Increase Dose" })).toBeInTheDocument();
    expect(within(doseRow).getByRole("button", { name: "16g" })).toBeInTheDocument();
    expect(within(yieldRow).getByRole("button", { name: "Decrease Yield" })).toBeInTheDocument();
    expect(within(yieldRow).getByRole("button", { name: "Increase Yield" })).toBeInTheDocument();
    expect(within(yieldRow).getByRole("button", { name: "1:2.0" })).toBeInTheDocument();

    expect(screen.getByDisplayValue("Morning spro")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dial-in")).toBeInTheDocument();
  });
});
