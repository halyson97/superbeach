import { create } from 'zustand';
import { setToken } from '../services/api';
import * as authApi from '../services/gamesApi';
import type { AuthUser } from '../services/gamesApi';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  hydrate: async () => {
    const token = localStorage.getItem('superbeach_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    setToken(token);
    set({ user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const { token, user } = await authApi.register(name, email, password);
    setToken(token);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    setToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
