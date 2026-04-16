import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../stores/authStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
    })
  })

  describe('initial state', () => {
    it('should have null accessToken initially', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.accessToken).toBeNull()
    })

    it('should have isAuthenticated false initially', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setAccessToken', () => {
    it('should set accessToken and isAuthenticated to true', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAccessToken('test-token')
      })

      expect(result.current.accessToken).toBe('test-token')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should store token in localStorage', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAccessToken('test-token')
      })

      expect(localStorage.getItem('accessToken')).toBe('test-token')
    })

    it('should clear accessToken when setting null', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAccessToken('test-token')
      })

      expect(result.current.accessToken).toBe('test-token')

      act(() => {
        result.current.setAccessToken(null)
      })

      expect(result.current.accessToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should remove token from localStorage when setting null', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAccessToken('test-token')
      })

      act(() => {
        result.current.setAccessToken(null)
      })

      expect(localStorage.getItem('accessToken')).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('should clear all auth state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAccessToken('test-token')
      })

      expect(result.current.isAuthenticated).toBe(true)

      act(() => {
        result.current.clearAuth()
      })

      expect(result.current.accessToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should remove accessToken from localStorage', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAccessToken('test-token')
      })

      act(() => {
        result.current.clearAuth()
      })

      expect(localStorage.getItem('accessToken')).toBeNull()
    })
  })

  describe('hydrate', () => {
    it('should restore state from localStorage', () => {
      localStorage.setItem('accessToken', 'stored-token')

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.hydrate()
      })

      expect(result.current.accessToken).toBe('stored-token')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should not overwrite existing token', () => {
      localStorage.setItem('accessToken', 'stored-token')

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setAccessToken('current-token')
      })

      act(() => {
        result.current.hydrate()
      })

      expect(result.current.accessToken).toBe('current-token')
    })
  })
})
