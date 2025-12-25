import { create } from 'zustand';

export const useSyncStore = create((set) => ({
  isOnline: false,
  pendingCount: 0,
  isSyncing: false,
  
  setOnline: (status) => set({ isOnline: status }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setSyncing: (status) => set({ isSyncing: status }),
}));
