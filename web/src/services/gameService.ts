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
import { GameManifest, GameSession } from '../sdk'

export const gameService = {
  async getGames(): Promise<Game[]> {
    const response = await api.get<Game[]>('/games')
    return response.data
  },

  async getGameById(id: string): Promise<Game> {
    const response = await api.get<Game>(`/games/${id}`)
    return response.data
  },

  async getGameManifest(id: string): Promise<GameManifest> {
    const response = await api.get<GameManifest>(`/games/${id}/manifest`)
    return response.data
  },

  async getGameSession(gameId: string): Promise<GameSession | null> {
    const response = await api.get<GameSession | null>(`/games/${gameId}/session`)
    return response.data
  },

  async saveGameSession(gameId: string, key: string, value: any): Promise<void> {
    await api.post(`/games/${gameId}/session/save`, { key, value })
  },

  async loadGameSession(gameId: string, key: string): Promise<any> {
    const response = await api.get(`/games/${gameId}/session/load`, { params: { key } })
    return response.data?.value
  },

  async clearGameSession(gameId: string): Promise<void> {
    await api.delete(`/games/${gameId}/session/clear`)
  },

  async finishGameSession(
    gameId: string,
    result: { score?: number; duration?: number; data?: any; achievements?: string[] }
  ): Promise<void> {
    await api.post(`/games/${gameId}/session/finish`, result)
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
