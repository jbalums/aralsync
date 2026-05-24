import { create } from 'zustand';
import { db } from '../../db';
import type { User } from '../../shared/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  setToken: (token: string) => void;
  updateUser: (fields: Partial<User>) => Promise<void>;
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

  updateUser: async (fields) => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) await db.users.update(userId, fields);
    set((s) => ({ user: s.user ? { ...s.user, ...fields } : null }));
  },

  clearAuth: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      await db.users.update(userId, { refreshToken: undefined });
    } else {
      // Hydration failure: user never loaded into memory — wipe all stored refresh tokens
      await db.users.toCollection().modify((u) => { delete u.refreshToken; });
    }
    set({ user: null, accessToken: null });
  },

  setHydrated: () => set({ isHydrated: true }),
}));
