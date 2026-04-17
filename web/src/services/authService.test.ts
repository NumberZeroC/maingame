import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService } from '../services/authService'
import * as apiModule from '../lib/api'

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  setToken: vi.fn(),
  setRefreshToken: vi.fn(),
  removeToken: vi.fn(),
  removeRefreshToken: vi.fn(),
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('login', () => {
    it('should call api.post with correct endpoint and data', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', phone: '13800138000', nickname: 'Test User' },
      }
      vi.mocked(apiModule.api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.login({
        phone: '13800138000',
        password: 'password123',
      })

      expect(apiModule.api.post).toHaveBeenCalledWith('/auth/login', {
        phone: '13800138000',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should store tokens after successful login', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', phone: '13800138000', nickname: 'Test User' },
      }
      vi.mocked(apiModule.api.post).mockResolvedValue({ data: mockResponse })

      await authService.login({ phone: '13800138000', password: 'password123' })

      expect(apiModule.setToken).toHaveBeenCalledWith('test-token')
      expect(apiModule.setRefreshToken).toHaveBeenCalledWith('test-refresh-token')
    })

    it('should not store tokens if accessToken is missing', async () => {
      const mockResponse = {
        user: { id: '1', phone: '13800138000', nickname: 'Test User' },
      }
      vi.mocked(apiModule.api.post).mockResolvedValue({ data: mockResponse })

      await authService.login({ phone: '13800138000', password: 'password123' })

      expect(apiModule.setToken).not.toHaveBeenCalled()
    })

    it('should throw error on login failure', async () => {
      vi.mocked(apiModule.api.post).mockRejectedValue(new Error('Invalid credentials'))

      await expect(authService.login({ phone: '13800138000', password: 'wrong' })).rejects.toThrow()
    })
  })

  describe('register', () => {
    it('should call api.post with correct endpoint and data', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', phone: '13800138000', nickname: 'New User' },
      }
      vi.mocked(apiModule.api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.register({
        phone: '13800138000',
        password: 'password123',
        nickname: 'New User',
      })

      expect(apiModule.api.post).toHaveBeenCalledWith('/auth/register', {
        phone: '13800138000',
        password: 'password123',
        nickname: 'New User',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should store tokens after successful registration', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', phone: '13800138000', nickname: 'New User' },
      }
      vi.mocked(apiModule.api.post).mockResolvedValue({ data: mockResponse })

      await authService.register({
        phone: '13800138000',
        password: 'password123',
        nickname: 'New User',
      })

      expect(apiModule.setToken).toHaveBeenCalledWith('test-token')
      expect(apiModule.setRefreshToken).toHaveBeenCalledWith('test-refresh-token')
    })
  })

  describe('refreshToken', () => {
    it('should call api.post with refresh token', async () => {
      const mockResponse = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
      }
      vi.mocked(apiModule.api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.refreshToken('old-refresh-token')

      expect(apiModule.api.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should store new tokens after refresh', async () => {
      const mockResponse = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
      }
      vi.mocked(apiModule.api.post).mockResolvedValue({ data: mockResponse })

      await authService.refreshToken('old-refresh-token')

      expect(apiModule.setToken).toHaveBeenCalledWith('new-token')
      expect(apiModule.setRefreshToken).toHaveBeenCalledWith('new-refresh-token')
    })
  })

  describe('logout', () => {
    it('should remove tokens from storage', () => {
      authService.logout()

      expect(apiModule.removeToken).toHaveBeenCalled()
      expect(apiModule.removeRefreshToken).toHaveBeenCalled()
    })
  })
})
