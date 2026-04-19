import { api } from '../lib/api'

export interface WordChainGame {
  _id: string
  currentWord: string
  lastChar: string
  userId: string
  status: 'playing' | 'completed' | 'failed'
  score: number
  rounds: number
  history: Array<{ word: string; by: 'user' | 'ai'; valid: boolean }>
  usedWords: string[]
  timeLimit: number
  startedAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface PlayResponse {
  success: boolean
  message: string
  nextWord: string | null
  game: WordChainGame
}

export const wordChainService = {
  async startGame(): Promise<WordChainGame> {
    const response = await api.post<WordChainGame>('/word-chain/start')
    return response.data
  },

  async play(gameId: string, word: string): Promise<PlayResponse> {
    const response = await api.post<PlayResponse>(`/word-chain/${gameId}/play`, { word })
    return response.data
  },

  async giveUp(gameId: string): Promise<WordChainGame> {
    const response = await api.post<WordChainGame>(`/word-chain/${gameId}/give-up`)
    return response.data
  },

  async getGame(gameId: string): Promise<WordChainGame> {
    const response = await api.get<WordChainGame>(`/word-chain/${gameId}`)
    return response.data
  },

  async getUserHistory(limit?: number): Promise<WordChainGame[]> {
    const response = await api.get<WordChainGame[]>('/word-chain/user/history', {
      params: { limit },
    })
    return response.data
  },
}