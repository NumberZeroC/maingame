import axios, { AxiosInstance } from 'axios'
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
} from '../interfaces'
import { AIProviderInterface } from '../interfaces/ai-provider.interface'

export abstract class BaseAIProvider implements AIProviderInterface {
  abstract readonly name: string
  abstract readonly type: AIProviderType

  protected client: AxiosInstance
  protected apiKey: string
  protected apiSecret?: string
  protected defaultModel: string
  protected baseUrl: string
  protected usageStats: UsageStats

  constructor(apiKey: string, apiSecret?: string, defaultModel?: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.defaultModel = defaultModel || this.getDefaultModel()
    this.baseUrl = baseUrl || this.getBaseUrl()
    this.usageStats = this.initUsageStats()
    this.client = axios.create({
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  abstract getDefaultModel(): string
  abstract getBaseUrl(): string
  abstract listModels(): Promise<AIModel[]>

  isAvailable(): boolean {
    return !!this.apiKey
  }

  abstract generateText(
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<TextGenerationResult>
  abstract chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>
  abstract generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult>

  getUsageStats(): UsageStats {
    return { ...this.usageStats }
  }

  protected updateUsageStats(promptTokens: number, completionTokens: number, cost: number): void {
    this.usageStats.requestCount++
    this.usageStats.totalPromptTokens += promptTokens
    this.usageStats.totalCompletionTokens += completionTokens
    this.usageStats.totalCost += cost
    this.usageStats.lastUsed = new Date()
  }

  estimateCost(promptTokens: number, completionTokens: number, model: string): number {
    const pricing = this.getModelPricing(model)
    if (!pricing) return 0

    const multiplier = pricing.unit === 'per_1m_tokens' ? 1 : 1000
    const inputCost = (promptTokens / multiplier) * pricing.input
    const outputCost = (completionTokens / multiplier) * pricing.output
    return inputCost + outputCost
  }

  abstract getModelPricing(
    model: string
  ): { input: number; output: number; unit: 'per_1k_tokens' | 'per_1m_tokens' | 'per_image' } | null

  protected initUsageStats(): UsageStats {
    return {
      provider: this.type,
      model: this.defaultModel,
      requestCount: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalCost: 0,
      lastUsed: new Date(),
    }
  }

  protected handleError(error: any, context: string): never {
    const errorMsg =
      error.response?.data?.error?.message || error.response?.data?.message || error.message
    console.error(`${this.name} API Error (${context}):`, errorMsg)
    throw new Error(`${context} failed: ${errorMsg}`)
  }
}
