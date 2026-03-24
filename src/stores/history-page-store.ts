import { create } from "zustand";

type HistoryPageState = {
  selectedShotId: string | null;
  setSelectedShotId: (id: string | null) => void;
};

export const useHistoryPageStore = create<HistoryPageState>((set) => ({
  selectedShotId: null,
  setSelectedShotId: (id) => set({ selectedShotId: id }),
}));
