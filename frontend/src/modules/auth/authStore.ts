import { create } from 'zustand';
import { db } from '../../db';
import type { User } from '../../shared/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  setToken: (token: string) => void;
  clearAuth: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await db.users.put({ ...user, refreshToken });
    set({ user, accessToken });
  },

  setToken: (accessToken) => set({ accessToken }),

  clearAuth: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      await db.users.update(userId, { refreshToken: undefined });
    }
    set({ user: null, accessToken: null });
  },

  setHydrated: () => set({ isHydrated: true }),
}));
