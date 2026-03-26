import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowsPage } from "./workflows-page";

const {
  useExportProfilesMutationMock,
  useImportProfilesMutationMock,
  useProfilesQueryMock,
  useRestoreDefaultProfileMutationMock,
  useUpdateWorkflowMutationMock,
  useWorkflowQueryMock,
} = vi.hoisted(() => ({
  useExportProfilesMutationMock: vi.fn(),
  useImportProfilesMutationMock: vi.fn(),
  useProfilesQueryMock: vi.fn(),
  useRestoreDefaultProfileMutationMock: vi.fn(),
  useUpdateWorkflowMutationMock: vi.fn(),
  useWorkflowQueryMock: vi.fn(),
}));

vi.mock("@/rest/queries", async () => {
  const actual = await vi.importActual<typeof import("@/rest/queries")>("@/rest/queries");

  return {
    ...actual,
    useExportProfilesMutation: useExportProfilesMutationMock,
    useImportProfilesMutation: useImportProfilesMutationMock,
    useProfilesQuery: useProfilesQueryMock,
    useRestoreDefaultProfileMutation: useRestoreDefaultProfileMutationMock,
    useUpdateWorkflowMutation: useUpdateWorkflowMutationMock,
    useWorkflowQuery: useWorkflowQueryMock,
  };
});

describe("WorkflowsPage", () => {
  const updateWorkflowMutate = vi.fn();
  const importProfilesMutateAsync = vi.fn();
  const exportProfilesMutateAsync = vi.fn();
  const restoreDefaultProfileMutateAsync = vi.fn();
  const anchorClick = vi.fn();
  const createObjectURL = vi.fn(() => "blob:profiles");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(anchorClick);

    useWorkflowQueryMock.mockReturnValue({
      data: {
        id: "workflow-1",
        name: "Morning",
        description: "Daily shot",
        profile: {
          title: "Active Profile",
          author: "Decent",
          beverage_type: "espresso",
          steps: [],
        },
        context: {
          targetDoseWeight: 18,
          targetYield: 36,
          grinderModel: "Niche Zero",
          grinderSetting: "5.2",
          coffeeName: "Red Brick",
          coffeeRoaster: "Square Mile",
        },
      },
    });
    useProfilesQueryMock.mockReturnValue({
      data: [
        {
          id: "profile:active",
          profile: {
            title: "Active Profile",
            author: "Decent",
            beverage_type: "espresso",
            steps: [],
          },
          visibility: "visible",
          isDefault: true,
        },
        {
          id: "profile:other",
          profile: {
            title: "Turbo",
            author: "Decent",
            beverage_type: "espresso",
            steps: [{ seconds: 10 }],
          },
          visibility: "visible",
          isDefault: false,
        },
      ],
    });
    useUpdateWorkflowMutationMock.mockReturnValue({
      isPending: false,
      mutate: updateWorkflowMutate,
    });
    useImportProfilesMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: importProfilesMutateAsync.mockResolvedValue({
        imported: 1,
        skipped: 0,
        failed: 0,
        errors: [],
      }),
    });
    useExportProfilesMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: exportProfilesMutateAsync.mockResolvedValue([
        {
          id: "profile:exported",
          profile: {
            title: "Exported Profile",
          },
        },
      ]),
    });
    useRestoreDefaultProfileMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: restoreDefaultProfileMutateAsync.mockResolvedValue({
        id: "profile:restored",
        profile: {
          title: "Best Practice",
        },
      }),
    });
  });

  it("imports, exports, and restores profile defaults", async () => {
    render(<WorkflowsPage />);

    const importInput = screen.getByLabelText("Import JSON");
    const importFile = new File(
      [
        JSON.stringify([
          {
            id: "profile:imported",
            profile: {
              title: "Imported Profile",
            },
          },
        ]),
      ],
      "profiles.json",
      { type: "application/json" },
    );

    fireEvent.change(importInput, {
      target: {
        files: [importFile],
      },
    });

    await waitFor(() => {
      expect(importProfilesMutateAsync).toHaveBeenCalledWith([
        {
          id: "profile:imported",
          profile: {
            title: "Imported Profile",
          },
        },
      ]);
    });

    expect(screen.getByText("Imported 1, skipped 0, failed 0.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));

    await waitFor(() => {
      expect(exportProfilesMutateAsync).toHaveBeenCalled();
    });

    expect(createObjectURL).toHaveBeenCalled();
    expect(anchorClick).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:profiles");
    expect(screen.getByText("Exported 1 profiles to a JSON download.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Bundled filename"), {
      target: { value: "best_practice.json" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Restore Default" }));

    await waitFor(() => {
      expect(restoreDefaultProfileMutateAsync).toHaveBeenCalledWith("best_practice.json");
    });

    expect(screen.getByText("Restored Best Practice from best_practice.json.")).toBeInTheDocument();
  });
});
