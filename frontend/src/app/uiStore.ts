import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  sidebarOpen: boolean;
  moreSheetOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  setSidebarOpen: (v: boolean) => void;
  setMoreSheetOpen: (v: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (msg: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  moreSheetOpen: false,
  activeModal: null,
  toasts: [],
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setMoreSheetOpen: (v) => set({ moreSheetOpen: v }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  addToast: (message, type = 'info') =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
