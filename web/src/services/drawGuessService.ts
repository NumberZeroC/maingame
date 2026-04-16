import { api } from '../lib/api'

export interface DrawGuessGame {
  _id: string
  word: string
  category: string
  imageUrl: string
  userId: string
  status: 'playing' | 'completed' | 'timeout'
  score: number
  attempts: number
  guesses: string[]
  timeLimit: number
  timeRemaining: number
  startedAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface StartGameResponse extends DrawGuessGame {}

export interface GuessResponse {
  correct: boolean
  message: string
  game: DrawGuessGame
}

export type GameCategory = 'animals' | 'plants' | 'objects' | 'food' | 'nature'

export const drawGuessService = {
  async startGame(category?: GameCategory): Promise<StartGameResponse> {
    const response = await api.post<StartGameResponse>('/draw-guess/start', { category })
    return response.data
  },

  async guess(gameId: string, guess: string): Promise<GuessResponse> {
    const response = await api.post<GuessResponse>(`/draw-guess/${gameId}/guess`, { guess })
    return response.data
  },

  async finishGame(gameId: string, timeRemaining: number): Promise<DrawGuessGame> {
    const response = await api.post<DrawGuessGame>(`/draw-guess/${gameId}/finish`, {
      timeRemaining,
    })
    return response.data
  },

  async getGame(gameId: string): Promise<DrawGuessGame> {
    const response = await api.get<DrawGuessGame>(`/draw-guess/${gameId}`)
    return response.data
  },

  async getUserHistory(limit?: number): Promise<DrawGuessGame[]> {
    const response = await api.get<DrawGuessGame[]>('/draw-guess/user/history', {
      params: { limit },
    })
    return response.data
  },

  async getLeaderboard(limit?: number): Promise<DrawGuessGame[]> {
    const response = await api.get<DrawGuessGame[]>('/draw-guess/leaderboard', {
      params: { limit },
    })
    return response.data
  },
}
