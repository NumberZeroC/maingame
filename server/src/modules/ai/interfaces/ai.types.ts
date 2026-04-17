export enum AIProviderType {
  ALIYUN_CODINGPLAN = 'aliyun_codingplan',
  ZHIPU = 'zhipu',
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
}

export interface AIModel {
  id: string
  name: string
  provider: AIProviderType
  type: 'text' | 'chat' | 'image'
  maxTokens?: number
  pricing?: {
    input: number
    output: number
    unit: 'per_1k_tokens' | 'per_1m_tokens' | 'per_image'
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface TextGenerationOptions {
  maxTokens?: number
  temperature?: number
  topP?: number
  stop?: string[]
  model?: string
}

export interface ChatOptions extends TextGenerationOptions {
  systemPrompt?: string
}

export interface ImageGenerationOptions {
  model?: string
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024' | string
  quality?: 'standard' | 'hd'
  n?: number
  style?: string
}

export interface TextGenerationResult {
  text: string
  model: string
  provider: AIProviderType
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
}

export interface ChatResult extends TextGenerationResult {}

export interface ImageGenerationResult {
  url: string
  model: string
  provider: AIProviderType
  cost?: number
}

export interface UsageStats {
  provider: AIProviderType
  model: string
  requestCount: number
  totalPromptTokens: number
  totalCompletionTokens: number
  totalCost: number
  lastUsed: Date
}

export interface ProviderConfig {
  apiKey: string
  apiSecret?: string
  model?: string
  baseUrl?: string
  enabled: boolean
  priority: number
  imageApiKey?: string
  imageBaseUrl?: string
  imageModel?: string
  imageFallbackModels?: string[]
}

export interface AIConfig {
  defaultProvider: AIProviderType
  providers: Record<AIProviderType, ProviderConfig>
  fallbackEnabled: boolean
  fallbackOrder: AIProviderType[]
  rateLimit: {
    maxRequestsPerMinute: number
    maxTokensPerMinute: number
  }
  costTracking: boolean
}
