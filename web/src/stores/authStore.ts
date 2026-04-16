import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  setAccessToken: (token: string | null) => void
  clearAuth: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      isAuthenticated: false,
      setAccessToken: (token) => {
        if (token) {
          localStorage.setItem('accessToken', token)
        } else {
          localStorage.removeItem('accessToken')
        }
        set({
          accessToken: token,
          isAuthenticated: !!token,
        })
      },
      clearAuth: () => {
        localStorage.removeItem('accessToken')
        set({
          accessToken: null,
          isAuthenticated: false,
        })
      },
      hydrate: () => {
        const token = localStorage.getItem('accessToken')
        if (token && !get().accessToken) {
          set({ accessToken: token, isAuthenticated: true })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
