import { Injectable, Logger } from '@nestjs/common'
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
} from './interfaces'
import { AIProviderInterface } from './interfaces/ai-provider.interface'
import { AIConfigService } from './ai-config.service'
import {
  AliyunCodingPlanProvider,
  ZhipuProvider,
  DeepSeekProvider,
  OpenAIProvider,
} from './providers'

@Injectable()
export class AICoreService {
  private readonly logger = new Logger(AICoreService.name)
  private readonly providers: Map<AIProviderType, AIProviderInterface> = new Map()
  private readonly requestCounts: Map<string, { count: number; resetAt: number }> = new Map()
  private readonly tokenCounts: Map<string, { count: number; resetAt: number }> = new Map()
  private readonly totalUsageStats: Map<AIProviderType, UsageStats> = new Map()

  constructor(private readonly configService: AIConfigService) {
    this.initializeProviders()
  }

  private initializeProviders(): void {
    const config = this.configService.getConfig()

    for (const [type, providerConfig] of Object.entries(config.providers)) {
      if (!providerConfig.enabled) continue

      const providerType = type as AIProviderType
      let provider: AIProviderInterface | null = null

      try {
        switch (providerType) {
          case AIProviderType.ALIYUN_CODINGPLAN:
            provider = new AliyunCodingPlanProvider(
              providerConfig.apiKey,
              providerConfig.apiSecret,
              providerConfig.model,
              providerConfig.baseUrl
            )
            break
          case AIProviderType.ZHIPU:
            provider = new ZhipuProvider(
              providerConfig.apiKey,
              providerConfig.apiSecret,
              providerConfig.model,
              providerConfig.baseUrl
            )
            break
          case AIProviderType.DEEPSEEK:
            provider = new DeepSeekProvider(
              providerConfig.apiKey,
              providerConfig.apiSecret,
              providerConfig.model,
              providerConfig.baseUrl
            )
            break
          case AIProviderType.OPENAI:
            provider = new OpenAIProvider(
              providerConfig.apiKey,
              providerConfig.apiSecret,
              providerConfig.model,
              providerConfig.baseUrl
            )
            break
        }

        if (provider && provider.isAvailable()) {
          this.providers.set(providerType, provider)
          this.logger.log(`Initialized AI provider: ${providerType}`)
        }
      } catch (error) {
        this.logger.error(`Failed to initialize provider ${providerType}: ${error}`)
      }
    }
  }

  private checkRateLimit(provider: AIProviderType): boolean {
    const config = this.configService.getRateLimitConfig()
    const now = Date.now()
    const minuteKey = `${provider}_${Math.floor(now / 60000)}`

    const requestCount = this.requestCounts.get(minuteKey) || { count: 0, resetAt: now + 60000 }
    if (requestCount.count >= config.maxRequestsPerMinute) {
      return false
    }
    requestCount.count++
    this.requestCounts.set(minuteKey, requestCount)

    return true
  }

  private updateTokenCount(provider: AIProviderType, tokens: number): void {
    const config = this.configService.getRateLimitConfig()
    const now = Date.now()
    const minuteKey = `${provider}_${Math.floor(now / 60000)}`

    const tokenCount = this.tokenCounts.get(minuteKey) || { count: 0, resetAt: now + 60000 }
    tokenCount.count += tokens

    if (tokenCount.count > config.maxTokensPerMinute) {
      this.logger.warn(`Token rate limit exceeded for ${provider}`)
    }

    this.tokenCounts.set(minuteKey, tokenCount)
  }

  private async executeWithFallback<T>(
    operation: (provider: AIProviderInterface) => Promise<T>,
    operationName: string
  ): Promise<T> {
    const fallbackOrder = this.configService.getFallbackOrder()
    const errors: Error[] = []

    for (const providerType of fallbackOrder) {
      const provider = this.providers.get(providerType)
      if (!provider) continue

      if (!this.checkRateLimit(providerType)) {
        this.logger.warn(`Rate limit exceeded for ${providerType}, trying next provider`)
        continue
      }

      try {
        this.logger.debug(`Executing ${operationName} with provider: ${providerType}`)
        const result = await operation(provider)

        if (this.configService.isCostTrackingEnabled()) {
          const stats = provider.getUsageStats()
          const existing = this.totalUsageStats.get(providerType) || {
            provider: providerType,
            model: stats.model,
            requestCount: 0,
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
            totalCost: 0,
            lastUsed: new Date(),
          }
          existing.requestCount++
          existing.totalPromptTokens += stats.totalPromptTokens
          existing.totalCompletionTokens += stats.totalCompletionTokens
          existing.totalCost += stats.totalCost
          existing.lastUsed = new Date()
          this.totalUsageStats.set(providerType, existing)
        }

        return result
      } catch (error: any) {
        this.logger.error(`${operationName} failed with ${providerType}: ${error.message}`)
        errors.push(error)
      }
    }

    throw new Error(
      `All AI providers failed for ${operationName}. Errors: ${errors.map((e) => e.message).join('; ')}`
    )
  }

  async generateText(
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<TextGenerationResult> {
    return this.executeWithFallback(async (provider) => {
      const result = await provider.generateText(prompt, options)
      this.updateTokenCount(result.provider, result.usage.totalTokens)
      return result
    }, 'generateText')
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult> {
    return this.executeWithFallback(async (provider) => {
      const result = await provider.chat(messages, options)
      this.updateTokenCount(result.provider, result.usage.totalTokens)
      return result
    }, 'chat')
  }

  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    return this.executeWithFallback(async (provider) => {
      const result = await provider.generateImage(prompt, options)
      return result
    }, 'generateImage')
  }

  async listModels(providerType?: AIProviderType): Promise<AIModel[]> {
    if (providerType) {
      const provider = this.providers.get(providerType)
      return provider ? provider.listModels() : []
    }

    const allModels: AIModel[] = []
    for (const provider of this.providers.values()) {
      allModels.push(...(await provider.listModels()))
    }
    return allModels
  }

  getProvider(providerType: AIProviderType): AIProviderInterface | undefined {
    return this.providers.get(providerType)
  }

  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys())
  }

  getUsageStats(providerType?: AIProviderType): UsageStats[] {
    if (providerType) {
      const stats = this.totalUsageStats.get(providerType)
      return stats ? [stats] : []
    }
    return Array.from(this.totalUsageStats.values())
  }

  getTotalCost(): number {
    let total = 0
    for (const stats of this.totalUsageStats.values()) {
      total += stats.totalCost
    }
    return total
  }

  estimateCost(
    providerType: AIProviderType,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const provider = this.providers.get(providerType)
    if (!provider) return 0
    return provider.estimateCost(promptTokens, completionTokens, model)
  }
}
