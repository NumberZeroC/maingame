import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('ApiClient', () => {
  let mockAxiosInstance: any

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
    ;(axios.create as any).mockReturnValue(mockAxiosInstance)
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('getToken', () => {
    it('should return null when no token in localStorage', async () => {
      const { getToken } = await import('../lib/api')
      expect(getToken()).toBeNull()
    })

    it('should return token from localStorage', async () => {
      localStorage.setItem('accessToken', 'test-token')
      const { getToken } = await import('../lib/api')
      expect(getToken()).toBe('test-token')
    })
  })

  describe('setToken', () => {
    it('should store token in localStorage', async () => {
      const { setToken, getToken } = await import('../lib/api')
      setToken('new-token')
      expect(getToken()).toBe('new-token')
    })
  })

  describe('removeToken', () => {
    it('should remove token from localStorage', async () => {
      localStorage.setItem('accessToken', 'test-token')
      const { removeToken, getToken } = await import('../lib/api')
      removeToken()
      expect(getToken()).toBeNull()
    })
  })

  describe('axios instance creation', () => {
    it('should create axios instance with correct config', async () => {
      await import('../lib/api')
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:4000',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should setup request interceptor', async () => {
      await import('../lib/api')
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('should setup response interceptor', async () => {
      await import('../lib/api')
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })
})
