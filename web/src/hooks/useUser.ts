import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/userService'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'

export function useGetMe() {
  const { isAuthenticated } = useAuthStore()
  const { setUser } = useUserStore()

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const user = await userService.getMe()
      setUser(user)
      return user
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
