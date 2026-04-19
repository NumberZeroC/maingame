import { api } from '../lib/api'

export interface NumberGuessGame {
  _id: string
  targetNumber: number
  minRange: number
  maxRange: number
  userId: string
  status: 'playing' | 'completed' | 'timeout'
  score: number
  attempts: number
  guesses: Array<{ value: number; result: 'higher' | 'lower' | 'correct' }>
  timeLimit: number
  startedAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface GuessResponse {
  correct: boolean
  result: 'higher' | 'lower' | 'correct'
  message: string
  game: NumberGuessGame
}

export const numberGuessService = {
  async startGame(minRange: number = 1, maxRange: number = 100): Promise<NumberGuessGame> {
    const response = await api.post<NumberGuessGame>('/number-guess/start', { minRange, maxRange })
    return response.data
  },

  async guess(gameId: string, guess: number): Promise<GuessResponse> {
    const response = await api.post<GuessResponse>(`/number-guess/${gameId}/guess`, { guess })
    return response.data
  },

  async giveUp(gameId: string): Promise<NumberGuessGame> {
    const response = await api.post<NumberGuessGame>(`/number-guess/${gameId}/give-up`)
    return response.data
  },

  async getGame(gameId: string): Promise<NumberGuessGame> {
    const response = await api.get<NumberGuessGame>(`/number-guess/${gameId}`)
    return response.data
  },

  async getUserHistory(limit?: number): Promise<NumberGuessGame[]> {
    const response = await api.get<NumberGuessGame[]>('/number-guess/user/history', {
      params: { limit },
    })
    return response.data
  },
}