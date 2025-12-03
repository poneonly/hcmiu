import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./auth";

export interface Credentials {
  username: string;
  password: string;
}

interface AuthStore {
  user: User | null;
  credentials: Credentials | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, credentials: Credentials, accessToken: string) => void;
  logout: () => void;
  getCredentials: () => Credentials | null;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      credentials: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user: User, credentials: Credentials, accessToken: string) =>
        set({ user, credentials, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, credentials: null, accessToken: null, isAuthenticated: false }),
      getCredentials: () => get().credentials,
      updateUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        credentials: state.credentials,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
