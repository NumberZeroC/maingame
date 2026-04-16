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

export type SDKMessageType =
  | 'sdk:getUser'
  | 'sdk:getUser:response'
  | 'sdk:generateText'
  | 'sdk:generateText:response'
  | 'sdk:generateImage'
  | 'sdk:generateImage:response'
  | 'sdk:storage:save'
  | 'sdk:storage:save:response'
  | 'sdk:storage:load'
  | 'sdk:storage:load:response'
  | 'sdk:storage:clear'
  | 'sdk:storage:clear:response'
  | 'sdk:analytics:track'
  | 'sdk:analytics:track:response'
  | 'sdk:leaderboard:submitScore'
  | 'sdk:leaderboard:submitScore:response'
  | 'sdk:leaderboard:getRanking'
  | 'sdk:leaderboard:getRanking:response'
  | 'sdk:response'
  | 'sdk:error'
  | 'sdk:ready'
  | 'game:ready'
  | 'game:finish'
  | 'game:error'
  | 'game:paused'
  | 'game:resumed'

export interface SDKMessage<T = any> {
  type: SDKMessageType
  requestId?: string
  payload?: T
  error?: string
}

export interface GenerateTextOptions {
  maxTokens?: number
  temperature?: number
}

export interface GenerateImageOptions {
  size?: string
  quality?: string
}

export interface StorageData {
  [key: string]: any
}

export interface AnalyticsEvent {
  name: string
  data?: Record<string, any>
}

export interface SDKError {
  code: string
  message: string
  details?: any
}

export class GameSDKError extends Error {
  code: string
  details?: any

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'GameSDKError'
    this.code = code
    this.details = details
  }
}

export type GameLifecycleStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'finished' | 'error'

export interface GameResult {
  score?: number
  duration?: number
  data?: Record<string, any>
  achievements?: string[]
}

export interface HostSDKConfig {
  gameId: string
  userId: string
  iframeRef?: React.RefObject<HTMLIFrameElement>
  onGameReady?: () => void
  onGameFinish?: (result: GameResult) => void
  onGameError?: (error: GameSDKError) => void
  onLifecycleChange?: (status: GameLifecycleStatus) => void
}

export type HostMessageType =
  | 'platform:init'
  | 'platform:start'
  | 'platform:pause'
  | 'platform:resume'
  | 'platform:destroy'
  | 'platform:response'

export interface HostMessage {
  type: HostMessageType
  requestId?: string
  payload?: any
}

export interface GameManifest {
  id: string
  slug: string
  name: string
  version: string
  entry: string
  thumbnail?: string
  banner?: string
  description?: string
  category?: string[]
  config?: {
    maxPlayers?: number
    avgDuration?: number
    difficulty?: string
    orientation?: string
    minAge?: number
  }
  aiRequirements?: {
    llm?: { enabled: boolean; model?: string; avgRequests?: number }
    imageGen?: { enabled: boolean; model?: string; avgRequests?: number }
    speech?: { enabled: boolean; type?: string }
  }
  permissions?: string[]
  assets?: {
    bundleUrl?: string
    bundleHash?: string
    size?: number
    preload?: string[]
  }
}

export interface GameSession {
  sessionId: string
  gameId: string
  userId: string
  saveData: Record<string, any>
  highScore: number
  totalPlayTime: number
  achievements: string[]
  lastPlayedAt: string
}
