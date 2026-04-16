import {
  AIProviderType,
  AIModel,
  ChatMessage,
  TextGenerationOptions,
  TextGenerationResult,
  ChatOptions,
  ChatResult,
  ImageGenerationOptions,
  ImageGenerationResult,
  UsageStats,
} from './ai.types'

export interface AIProviderInterface {
  readonly name: string
  readonly type: AIProviderType

  isAvailable(): boolean

  generateText(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult>

  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>

  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>

  listModels(): Promise<AIModel[]>

  getUsageStats(): UsageStats

  estimateCost(promptTokens: number, completionTokens: number, model: string): number
}
