export interface SDKUser {
  id: string
  phone: string
  email?: string
  nickname: string
  avatar?: string
  vipLevel: number
  coins: number
}

export interface SDKConfig {
  gameId: string
  origin?: string
  timeout?: number
}

export interface GenerateTextOptions {
  maxTokens?: number
  temperature?: number
}

export interface GenerateImageOptions {
  size?: string
  quality?: string
}

export interface GameResult {
  score?: number
  duration?: number
  data?: Record<string, any>
  achievements?: string[]
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  nickname: string
  avatar?: string
  score: number
  playedAt?: string
}

export class GameSDKError extends Error {
  code: string
  details?: any
}

export type GameLifecycleStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'finished' | 'error'

export interface GameLifecycle {
  onInit?(config: SDKConfig): Promise<void> | void
  onLoad?(): Promise<void> | void
  onStart?(): void
  onPause?(): void
  onResume?(): void
  onFinish?(result: GameResult): GameResult | void
  onDestroy?(): void
}

declare global {
  interface Window {
    GameSDK: {
      GameSDK: typeof GameSDK
      GameSDKError: typeof GameSDKError
      createGameSDK: (config: SDKConfig) => GameSDK
    }
    GameLifecycle: GameLifecycle
  }
}

export declare class GameSDK {
  ai: {
    generateText: (prompt: string, options?: GenerateTextOptions) => Promise<string>
    generateImage: (prompt: string, options?: GenerateImageOptions) => Promise<string>
  }
  storage: {
    save: (key: string, value: any) => Promise<void>
    load: <T>(key: string) => Promise<T | null>
    clear: () => Promise<void>
  }
  analytics: {
    track: (event: string, data?: Record<string, any>) => Promise<void>
  }
  leaderboard: {
    submitScore: (score: number, extraData?: Record<string, any>) => Promise<void>
    getRanking: (type?: 'global' | 'friends', limit?: number) => Promise<LeaderboardEntry[]>
  }

  constructor(config: SDKConfig)
  onReady(callback: () => void): void
  getUser(): Promise<SDKUser>
  destroy(): void
}
