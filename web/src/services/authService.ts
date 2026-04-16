import { api, setToken, setRefreshToken, removeToken, removeRefreshToken } from '../lib/api'
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenResponse } from '../types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    if (response.data.accessToken) {
      setToken(response.data.accessToken)
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken)
      }
    }
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    if (response.data.accessToken) {
      setToken(response.data.accessToken)
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken)
      }
    }
    return response.data
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', { refreshToken })
    if (response.data.accessToken) {
      setToken(response.data.accessToken)
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken)
      }
    }
    return response.data
  },

  logout(): void {
    removeToken()
    removeRefreshToken()
  },
}
