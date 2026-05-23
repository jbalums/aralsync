import { create } from 'zustand';
import type { Quarter } from '../../shared/types';

interface GradebookState {
  activeClassLoadId: string | null;
  activeQuarter: Quarter;
  dirtyEntries: Set<string>;
  isFinalized: boolean;
  setActiveClassLoadId: (id: string | null) => void;
  setActiveQuarter: (q: Quarter) => void;
  markDirty: (entryKey: string) => void;
  clearDirty: () => void;
  setFinalized: (v: boolean) => void;
}

export const useGradebookStore = create<GradebookState>((set) => ({
  activeClassLoadId: null,
  activeQuarter: 'Q1',
  dirtyEntries: new Set(),
  isFinalized: false,
  setActiveClassLoadId: (id) => set({ activeClassLoadId: id }),
  setActiveQuarter: (q) => set({ activeQuarter: q }),
  markDirty: (key) => set((s) => ({ dirtyEntries: new Set(s.dirtyEntries).add(key) })),
  clearDirty: () => set({ dirtyEntries: new Set() }),
  setFinalized: (v) => set({ isFinalized: v }),
}));
