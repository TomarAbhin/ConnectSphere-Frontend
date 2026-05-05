import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: '',
      refreshToken: '',
      isLoggedIn: false,
      login: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isLoggedIn: true }),
      logout: () => set({ user: null, accessToken: '', refreshToken: '', isLoggedIn: false }),
      updateUser: (user) => set({ user }),
      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken, isLoggedIn: Boolean(accessToken) }),
      getAccessToken: () => get().accessToken,
    }),
    {
      name: 'connectsphere-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
