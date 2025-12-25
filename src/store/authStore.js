import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { email }
      role: null, // 'OPERATOR' | 'SUPERVISOR'
      token: null,
      tenantId: 'demo-tenant',
      
      login: (email, role) => set({
        user: { email },
        role: role,
        token: 'fake-jwt-token-' + Date.now(),
        tenantId: 'demo-tenant',
      }),
      
      logout: () => set({
        user: null,
        role: null,
        token: null,
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
