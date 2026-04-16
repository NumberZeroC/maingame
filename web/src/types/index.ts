export interface User {
  id: string
  phone: string
  email?: string
  nickname: string
  avatar?: string
  vipLevel: number
  coins: number
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  phone: string
  password: string
}

export interface RegisterRequest {
  phone: string
  password: string
  nickname: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface UpdateUserRequest {
  email?: string
  nickname?: string
  avatar?: string
}

export interface Game {
  _id: string
  name: string
  description?: string
  category?: string[]
  version?: string
  thumbnail?: string
  banner?: string
  entry?: string
  config?: Record<string, any>
  aiRequirements?: Record<string, any>
  status: string
  stats?: {
    playCount: number
    likeCount: number
    rating: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateGameRequest {
  name: string
  description?: string
  category?: string[]
  version?: string
  thumbnail?: string
  banner?: string
  entry?: string
  config?: Record<string, any>
  aiRequirements?: Record<string, any>
  status?: string
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {}

export interface PlayGameRequest {
  gameId: string
  action: string
  data?: any
}

export interface PlayGameResponse {
  success: boolean
  data?: any
  message?: string
}

export interface SubmitScoreRequest {
  gameId: string
  score: number
  data?: any
}

export interface SubmitScoreResponse {
  success: boolean
  score?: number
  rank?: number
  message?: string
}

export interface GenerateTextRequest {
  prompt: string
  options?: {
    maxTokens?: number
    temperature?: number
  }
}

export interface GenerateTextResponse {
  result: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  result: string
}

export interface GenerateImageRequest {
  prompt: string
  options?: {
    size?: string
    quality?: string
  }
}

export interface GenerateImageResponse {
  url: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}
