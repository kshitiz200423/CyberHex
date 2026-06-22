/* ═══════════════════════════════════════════════════════════════════════════
 * Auronix Technologies — Zustand Auth Store
 * Access token in-memory only; user metadata persisted to localStorage.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from './types';

// ─── State Interface ───────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateToken: (token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isAnalyst: () => boolean;
  isClient: () => boolean;
}

// ─── Store Creation ────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user: User, token: string) => {
        set({ user, accessToken: token });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null });
      },

      updateToken: (token: string) => {
        set({ accessToken: token });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      isAuthenticated: () => {
        const state = get();
        return state.user !== null && state.accessToken !== null;
      },

      isAdmin: () => get().user?.role === 'admin',
      isAnalyst: () => get().user?.role === 'analyst',
      isClient: () => get().user?.role === 'client',
    }),
    {
      name: 'auronix-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist user metadata — accessToken stays in memory only
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
