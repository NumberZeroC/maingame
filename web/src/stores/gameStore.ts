import { create } from 'zustand'
import { Game } from '../types'

type GameData = Record<string, unknown>

interface GameState {
  currentGame: Game | null
  gameData: GameData | null
  isPlaying: boolean
  setCurrentGame: (game: Game | null) => void
  setGameData: (data: GameData | null) => void
  setIsPlaying: (isPlaying: boolean) => void
  clearGame: () => void
}

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  gameData: null,
  isPlaying: false,
  setCurrentGame: (game) => set({ currentGame: game }),
  setGameData: (data) => set({ gameData: data }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  clearGame: () =>
    set({
      currentGame: null,
      gameData: null,
      isPlaying: false,
    }),
}))
