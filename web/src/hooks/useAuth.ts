import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { LoginRequest, RegisterRequest, AuthResponse, ApiError } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const { setAccessToken } = useAuthStore()
  const { setUser } = useUserStore()

  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      setTimeout(() => navigate('/', { replace: true }), 0)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const { setAccessToken } = useAuthStore()
  const { setUser } = useUserStore()

  return useMutation<AuthResponse, ApiError, RegisterRequest>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      setTimeout(() => navigate('/', { replace: true }), 0)
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()
  const { clearUser } = useUserStore()

  return () => {
    authService.logout()
    clearAuth()
    clearUser()
    navigate('/login')
  }
}
