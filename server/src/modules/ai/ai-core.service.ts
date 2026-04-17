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
import { AIConfigFileService } from './ai-config-file.service'
import {
  AliyunCodingPlanProvider,
  AliyunDashScopeProvider,
  ZhipuProvider,
  DeepSeekProvider,
  OpenAIProvider,
} from './providers'

interface GameQuota {
  gameId: string
  dailyLimit: number
  usedToday: number
  lastReset: Date
}

@Injectable()
export class AICoreService {
  private readonly logger = new Logger(AICoreService.name)
  private readonly providers: Map<AIProviderType, AIProviderInterface> = new Map()
  private readonly imageProviders: Map<AIProviderType, AIProviderInterface> = new Map()
  private readonly requestCounts: Map<string, { count: number; resetAt: number }> = new Map()
  private readonly tokenCounts: Map<string, { count: number; resetAt: number }> = new Map()
  private readonly totalUsageStats: Map<AIProviderType, UsageStats> = new Map()
  private readonly gameQuotas: Map<string, GameQuota> = new Map()

  constructor(
    private readonly configService: AIConfigService,
    private readonly configFileService: AIConfigFileService
  ) {
    this.initializeProviders()
    this.initializeGameQuotas()
  }

  private initializeGameQuotas(): void {
    this.gameQuotas.set('default', {
      gameId: 'default',
      dailyLimit: 100,
      usedToday: 0,
      lastReset: new Date(),
    })
  }

  private initializeProviders(): void {
    const enabledProviders = this.configService.getEnabledProviders()

    for (const providerType of enabledProviders) {
      const providerConfig = this.configService.getProviderConfig(providerType)
      if (!providerConfig || !providerConfig.enabled) continue

      try {
        let provider: AIProviderInterface

        switch (providerType) {
          case AIProviderType.ALIYUN_CODINGPLAN:
            provider = new AliyunCodingPlanProvider(
              providerConfig.apiKey,
              providerConfig.apiSecret,
              providerConfig.model,
              providerConfig.baseUrl
            )
            if (providerConfig.imageApiKey) {
              const imageProvider = new AliyunDashScopeProvider(
                providerConfig.imageApiKey,
                providerConfig.imageBaseUrl,
                providerConfig.imageFallbackModels
              )
              this.imageProviders.set(providerType, imageProvider)
              this.logger.log(
                `Initialized image provider: ${providerType} with model ${providerConfig.imageModel}`
              )
            }
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
          default:
            this.logger.warn(`Unknown provider type: ${providerType}`)
            continue
        }

        if (provider.isAvailable()) {
          this.providers.set(providerType, provider)
          this.logger.log(`Initialized AI provider: ${providerType}`)
        }
      } catch (error) {
        this.logger.error(`Failed to initialize provider ${providerType}: ${error}`)
      }
    }

    if (this.providers.size === 0) {
      this.logger.warn('No AI providers initialized. AI features may not work.')
    }
  }

  private getGameQuota(gameId: string): GameQuota {
    if (!this.gameQuotas.has(gameId)) {
      this.gameQuotas.set(gameId, {
        gameId,
        dailyLimit: 50,
        usedToday: 0,
        lastReset: new Date(),
      })
    }
    return this.gameQuotas.get(gameId)!
  }

  private checkGameQuota(gameId: string): boolean {
    const quota = this.getGameQuota(gameId)
    const now = new Date()
    const lastReset = new Date(quota.lastReset)

    if (
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      quota.usedToday = 0
      quota.lastReset = now
    }

    return quota.usedToday < quota.dailyLimit
  }

  private incrementGameQuota(gameId: string): void {
    const quota = this.getGameQuota(gameId)
    quota.usedToday++
  }

  private checkRateLimit(provider: AIProviderType): boolean {
    const config = this.configFileService.getRateLimitConfig()
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
    const config = this.configFileService.getRateLimitConfig()
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
    operationName: string,
    gameId?: string
  ): Promise<T> {
    if (gameId && !this.checkGameQuota(gameId)) {
      throw new Error(`Game ${gameId} has exceeded daily AI quota`)
    }

    const fallbackOrder = this.configFileService.getFallbackOrder()
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

        if (gameId) {
          this.incrementGameQuota(gameId)
        }

        if (this.configFileService.isCostTrackingEnabled()) {
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
    options?: TextGenerationOptions,
    gameId?: string
  ): Promise<TextGenerationResult> {
    return this.executeWithFallback(
      async (provider) => {
        const result = await provider.generateText(prompt, options)
        this.updateTokenCount(result.provider, result.usage.totalTokens)
        return result
      },
      'generateText',
      gameId
    )
  }

  async chat(messages: ChatMessage[], options?: ChatOptions, gameId?: string): Promise<ChatResult> {
    return this.executeWithFallback(
      async (provider) => {
        const result = await provider.chat(messages, options)
        this.updateTokenCount(result.provider, result.usage.totalTokens)
        return result
      },
      'chat',
      gameId
    )
  }

  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions,
    gameId?: string
  ): Promise<ImageGenerationResult> {
    if (gameId && !this.checkGameQuota(gameId)) {
      throw new Error(`Game ${gameId} has exceeded daily AI quota`)
    }

    const fallbackOrder = this.configFileService.getFallbackOrder()
    const errors: Error[] = []

    for (const providerType of fallbackOrder) {
      const imageProvider = this.imageProviders.get(providerType)
      if (imageProvider && imageProvider.isAvailable()) {
        try {
          this.logger.debug(`Generating image with image provider: ${providerType}`)
          const result = await imageProvider.generateImage(prompt, options)

          if (gameId) {
            this.incrementGameQuota(gameId)
          }

          return result
        } catch (error: any) {
          this.logger.error(`Image generation failed with ${providerType}: ${error.message}`)
          errors.push(error)
        }
      }

      const provider = this.providers.get(providerType)
      if (!provider) continue

      try {
        this.logger.debug(`Generating image with provider: ${providerType}`)
        const result = await provider.generateImage(prompt, options)

        if (gameId) {
          this.incrementGameQuota(gameId)
        }

        return result
      } catch (error: any) {
        this.logger.error(`Image generation failed with ${providerType}: ${error.message}`)
        errors.push(error)
      }
    }

    throw new Error(
      `All AI providers failed for generateImage. Errors: ${errors.map((e) => e.message).join('; ')}`
    )
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

  getGameQuotaStatus(gameId: string): { used: number; limit: number; remaining: number } {
    const quota = this.getGameQuota(gameId)
    return {
      used: quota.usedToday,
      limit: quota.dailyLimit,
      remaining: quota.dailyLimit - quota.usedToday,
    }
  }

  setGameQuota(gameId: string, dailyLimit: number): void {
    const quota = this.getGameQuota(gameId)
    quota.dailyLimit = dailyLimit
    this.gameQuotas.set(gameId, quota)
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

  reloadProviders(): void {
    this.logger.log('Reloading AI providers...')
    this.providers.clear()
    this.imageProviders.clear()
    this.initializeProviders()
    this.logger.log(`Providers reloaded: ${Array.from(this.providers.keys()).join(', ')}`)
    this.logger.log(
      `Image providers reloaded: ${Array.from(this.imageProviders.keys()).join(', ')}`
    )
  }
}
