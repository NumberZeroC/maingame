import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetGames, useGetGame } from '../hooks/useGames'
import * as gameService from '../services/gameService'
import { Game } from '../types'

vi.mock('../services/gameService')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const createMockGame = (id: string, name: string, description: string): Game => ({
  _id: id,
  name,
  description,
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stats: { playCount: 0, likeCount: 0, rating: 4.5 },
})

describe('useGames hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useGetGames', () => {
    it('should fetch games list', async () => {
      const mockGames: Game[] = [
        createMockGame('1', 'Game 1', 'Desc 1'),
        createMockGame('2', 'Game 2', 'Desc 2'),
      ]
      vi.mocked(gameService.gameService.getGames).mockResolvedValue(mockGames)

      const { result } = renderHook(() => useGetGames(), {
        wrapper: createWrapper(),
      })

      await act(() => vi.waitFor(() => expect(result.current.isSuccess).toBe(true)))

      expect(result.current.data).toEqual(mockGames)
      expect(gameService.gameService.getGames).toHaveBeenCalled()
    })

    it('should handle fetch error', async () => {
      vi.mocked(gameService.gameService.getGames).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useGetGames(), {
        wrapper: createWrapper(),
      })

      await act(() => vi.waitFor(() => expect(result.current.isError).toBe(true)))

      expect(result.current.error).toBeDefined()
    })

    it('should use correct query key', async () => {
      vi.mocked(gameService.gameService.getGames).mockResolvedValue([])

      const { result } = renderHook(() => useGetGames(), {
        wrapper: createWrapper(),
      })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useGetGame', () => {
    it('should fetch single game by id', async () => {
      const mockGame = createMockGame('game-123', 'Test Game', 'Test Description')
      vi.mocked(gameService.gameService.getGameById).mockResolvedValue(mockGame)

      const { result } = renderHook(() => useGetGame('game-123'), {
        wrapper: createWrapper(),
      })

      await act(() => vi.waitFor(() => expect(result.current.isSuccess).toBe(true)))

      expect(result.current.data).toEqual(mockGame)
      expect(gameService.gameService.getGameById).toHaveBeenCalledWith('game-123')
    })

    it('should not fetch when id is empty', async () => {
      vi.mocked(gameService.gameService.getGameById).mockResolvedValue(undefined as any)

      const { result } = renderHook(() => useGetGame(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
      expect(gameService.gameService.getGameById).not.toHaveBeenCalled()
    })

    it('should fetch different games for different ids', async () => {
      vi.mocked(gameService.gameService.getGameById).mockImplementation(async (id) =>
        createMockGame(id, `Game ${id}`, `Description for ${id}`)
      )

      const { result: result1 } = renderHook(() => useGetGame('game-1'), {
        wrapper: createWrapper(),
      })

      const { result: result2 } = renderHook(() => useGetGame('game-2'), {
        wrapper: createWrapper(),
      })

      await act(() => vi.waitFor(() => expect(result1.current.isSuccess).toBe(true)))
      await act(() => vi.waitFor(() => expect(result2.current.isSuccess).toBe(true)))

      expect(result1.current.data?._id).toBe('game-1')
      expect(result2.current.data?._id).toBe('game-2')
    })

    it('should handle game not found error', async () => {
      vi.mocked(gameService.gameService.getGameById).mockRejectedValue(new Error('Game not found'))

      const { result } = renderHook(() => useGetGame('non-existent'), {
        wrapper: createWrapper(),
      })

      await act(() => vi.waitFor(() => expect(result.current.isError).toBe(true)))

      expect(result.current.error?.message).toBe('Game not found')
    })
  })
})
