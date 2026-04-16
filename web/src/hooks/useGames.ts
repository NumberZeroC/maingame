import { useQuery } from '@tanstack/react-query'
import { gameService } from '../services/gameService'

export function useGetGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: gameService.getGames,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetGame(id: string) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => gameService.getGameById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
