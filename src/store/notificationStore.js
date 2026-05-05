import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
