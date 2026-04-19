import { api } from '../lib/api'

export interface Suspect {
  id: string
  name: string
  occupation: string
  relationship: string
  personality: string
  testimony: string[]
  isCulprit: boolean
  alibi: string
  secrets: string[]
  questioned: boolean
}

export interface Clue {
  id: string
  name: string
  description: string
  location: string
  importance: 'minor' | 'major' | 'critical'
  discovered: boolean
  hints: string[]
}

export interface Conversation {
  suspectId: string
  messages: Array<{ role: 'user' | 'ai'; content: string; timestamp: string }>
}

export interface DetectiveGame {
  _id: string
  title: string
  scenario: string
  victimName: string
  location: string
  suspects: Suspect[]
  clues: Clue[]
  culpritId: string
  solution: string
  userId: string
  status: 'playing' | 'investigating' | 'solved' | 'failed'
  investigationPoints: number
  conversations: Conversation[]
  discoveredClues: string[]
  deductions: Array<{ statement: string; timestamp: string; correct: boolean }>
  finalAccusation?: {
    suspectId: string
    reasoning: string
    timestamp: string
    correct: boolean
  }
  score: number
  maxQuestionsPerSuspect: number
  startedAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface QuestionResponse {
  response: string
  game: DetectiveGame
  questionsRemaining: number
}

export interface InvestigateResponse {
  discovery: string
  game: DetectiveGame
}

export interface DeductionResponse {
  feedback: string
  correct: boolean
  game: DetectiveGame
}

export interface AccuseResponse {
  correct: boolean
  message: string
  game: DetectiveGame
}

export const detectiveGameService = {
  async startGame(): Promise<DetectiveGame> {
    const response = await api.post<DetectiveGame>('/detective-game/start')
    return response.data
  },

  async questionSuspect(gameId: string, suspectId: string, question: string): Promise<QuestionResponse> {
    const response = await api.post<QuestionResponse>(`/detective-game/${gameId}/question`, {
      suspectId,
      question,
    })
    return response.data
  },

  async investigateClue(gameId: string, clueId: string): Promise<InvestigateResponse> {
    const response = await api.post<InvestigateResponse>(`/detective-game/${gameId}/investigate`, {
      clueId,
    })
    return response.data
  },

  async makeDeduction(gameId: string, statement: string): Promise<DeductionResponse> {
    const response = await api.post<DeductionResponse>(`/detective-game/${gameId}/deduce`, {
      statement,
    })
    return response.data
  },

  async accuse(gameId: string, suspectId: string, reasoning: string): Promise<AccuseResponse> {
    const response = await api.post<AccuseResponse>(`/detective-game/${gameId}/accuse`, {
      suspectId,
      reasoning,
    })
    return response.data
  },

  async giveUp(gameId: string): Promise<DetectiveGame> {
    const response = await api.post<DetectiveGame>(`/detective-game/${gameId}/give-up`)
    return response.data
  },

  async getGame(gameId: string): Promise<DetectiveGame> {
    const response = await api.get<DetectiveGame>(`/detective-game/${gameId}`)
    return response.data
  },

  async getUserHistory(limit?: number): Promise<DetectiveGame[]> {
    const response = await api.get<DetectiveGame[]>('/detective-game/user/history', {
      params: { limit },
    })
    return response.data
  },
}