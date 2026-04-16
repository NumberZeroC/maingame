import { create } from 'zustand'
import { User } from '../types'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (data: Partial<User>) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
  clearUser: () => set({ user: null }),
}))
