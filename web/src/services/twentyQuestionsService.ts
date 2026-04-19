import { api } from '../lib/api'

export interface TwentyQuestionsGame {
  _id: string
  answer: string
  category: string
  userId: string
  status: 'playing' | 'completed' | 'failed'
  score: number
  questions: Array<{ question: string; answer: 'yes' | 'no' | 'unknown' }>
  guesses: Array<{ guess: string; correct: boolean }>
  questionsRemaining: number
  startedAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AskResponse {
  answer: 'yes' | 'no' | 'unknown'
  message: string
  game: TwentyQuestionsGame
}

export interface GuessAnswerResponse {
  correct: boolean
  message: string
  game: TwentyQuestionsGame
}

export const twentyQuestionsService = {
  async startGame(category?: string): Promise<TwentyQuestionsGame> {
    const response = await api.post<TwentyQuestionsGame>('/twenty-questions/start', { category })
    return response.data
  },

  async ask(gameId: string, question: string): Promise<AskResponse> {
    const response = await api.post<AskResponse>(`/twenty-questions/${gameId}/ask`, { question })
    return response.data
  },

  async guess(gameId: string, guess: string): Promise<GuessAnswerResponse> {
    const response = await api.post<GuessAnswerResponse>(`/twenty-questions/${gameId}/guess`, {
      guess,
    })
    return response.data
  },

  async giveUp(gameId: string): Promise<TwentyQuestionsGame> {
    const response = await api.post<TwentyQuestionsGame>(`/twenty-questions/${gameId}/give-up`)
    return response.data
  },

  async getGame(gameId: string): Promise<TwentyQuestionsGame> {
    const response = await api.get<TwentyQuestionsGame>(`/twenty-questions/${gameId}`)
    return response.data
  },

  async getUserHistory(limit?: number): Promise<TwentyQuestionsGame[]> {
    const response = await api.get<TwentyQuestionsGame[]>('/twenty-questions/user/history', {
      params: { limit },
    })
    return response.data
  },
}