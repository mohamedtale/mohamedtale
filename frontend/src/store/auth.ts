import { create } from 'zustand';
import type { User } from '@/types';
import { storeAuth, clearAuth, getStoredUser } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  login: (user, accessToken, refreshToken) => {
    storeAuth(user, accessToken, refreshToken);
    set({ user });
  },

  logout: () => {
    clearAuth();
    set({ user: null });
  },

  loadFromStorage: () => {
    const user = getStoredUser();
    set({ user, isLoading: false });
  },
}));
