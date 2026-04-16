import { api } from '../lib/api'
import {
  Game,
  CreateGameRequest,
  UpdateGameRequest,
  PlayGameRequest,
  PlayGameResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
} from '../types'

export const gameService = {
  async getGames(): Promise<Game[]> {
    const response = await api.get<Game[]>('/games')
    return response.data
  },

  async getGameById(id: string): Promise<Game> {
    const response = await api.get<Game>(`/games/${id}`)
    return response.data
  },

  async playGame(data: PlayGameRequest): Promise<PlayGameResponse> {
    const response = await api.post<PlayGameResponse>(`/games/${data.gameId}/play`, {
      action: data.action,
      data: data.data,
    })
    return response.data
  },

  async submitScore(data: SubmitScoreRequest): Promise<SubmitScoreResponse> {
    const response = await api.post<SubmitScoreResponse>(`/games/${data.gameId}/score`, {
      score: data.score,
      data: data.data,
    })
    return response.data
  },

  async createGame(data: CreateGameRequest): Promise<Game> {
    const response = await api.post<Game>('/games', data)
    return response.data
  },

  async updateGame(id: string, data: UpdateGameRequest): Promise<Game> {
    const response = await api.put<Game>(`/games/${id}`, data)
    return response.data
  },

  async deleteGame(id: string): Promise<void> {
    await api.delete(`/games/${id}`)
  },
}
