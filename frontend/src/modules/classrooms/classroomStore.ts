import { create } from 'zustand';

interface ClassroomState {
  activeClassLoadId: string | null;
  setActiveClassLoadId: (id: string | null) => void;
}

export const useClassroomStore = create<ClassroomState>((set) => ({
  activeClassLoadId: null,
  setActiveClassLoadId: (id) => set({ activeClassLoadId: id }),
}));
