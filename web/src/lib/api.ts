import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios'
import { ApiError } from '../types'

const TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

interface RequestConfigWithId extends InternalAxiosRequestConfig {
  requestId?: string
}

function getBaseUrl(): string {
  return '/api'
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function shouldRetry(error: AxiosError): boolean {
  return !error.response || error.response.status >= 500
}

class ApiClient {
  private instance: AxiosInstance
  private errorHandlers: ((error: ApiError) => void)[] = []
  private retryCount: Map<string, number> = new Map()

  constructor() {
    this.instance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.baseURL = getBaseUrl()
        const token = this.getToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        const requestId = generateRequestId()
        config.headers['X-Request-Id'] = requestId
        ;(config as RequestConfigWithId).requestId = requestId
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    this.setupResponseInterceptor()
  }

  private setupResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response) => {
        const requestId = (response.config as RequestConfigWithId)?.requestId
        if (requestId) {
          this.retryCount.delete(requestId)
        }
        return response
      },
      async (error: AxiosError<ApiError>) => {
        const requestId = (error.config as RequestConfigWithId)?.requestId

        if (error.response?.status === 401) {
          this.removeToken()
          this.removeRefreshToken()
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            if (currentPath !== '/login' && currentPath !== '/register') {
              window.location.href = '/login'
            }
          }
        }

        if (shouldRetry(error) && requestId) {
          const currentRetry = this.retryCount.get(requestId) || 0
          if (currentRetry < MAX_RETRIES) {
            this.retryCount.set(requestId, currentRetry + 1)
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (currentRetry + 1)))
            return this.instance.request(error.config as AxiosRequestConfig)
          }
        }

        if (requestId) {
          this.retryCount.delete(requestId)
        }

        const errorMessage = error.response?.data?.message
        const messageStr = Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : errorMessage || error.message || 'An error occurred'

        const apiError: ApiError = {
          message: messageStr,
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error,
        }

        this.notifyErrorHandlers(apiError)

        return Promise.reject(apiError)
      }
    )
  }

  addErrorHandler(handler: (error: ApiError) => void): void {
    this.errorHandlers.push(handler)
  }

  removeErrorHandler(handler: (error: ApiError) => void): void {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== handler)
  }

  private notifyErrorHandlers(error: ApiError): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error)
      } catch (err) {
        console.error('Error handler failed:', err)
      }
    })
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  }

  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }

  removeRefreshToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance
  }
}

const apiClient = new ApiClient()
export const api = apiClient.getAxiosInstance()
export const {
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  addErrorHandler,
  removeErrorHandler,
} = apiClient

export function initializeTokenFromStorage(): string | null {
  return getToken()
}
