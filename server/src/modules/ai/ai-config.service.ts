import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AIProviderType, AIConfig, ProviderConfig } from './interfaces'

@Injectable()
export class AIConfigService {
  private readonly logger = new Logger(AIConfigService.name)
  private config: AIConfig

  constructor(private configService: ConfigService) {
    this.config = this.loadConfig()
  }

  private loadConfig(): AIConfig {
    const providerEnv = process.env.AI_PROVIDER?.toLowerCase() || 'openai'

    const defaultProvider = this.parseProviderType(providerEnv)

    const providers: Record<AIProviderType, ProviderConfig> = {
      [AIProviderType.ALIYUN_CODINGPLAN]: {
        apiKey: process.env.ALIYUN_CODINGPLAN_API_KEY || '',
        model: process.env.ALIYUN_CODINGPLAN_MODEL || 'glm-5',
        baseUrl: process.env.ALIYUN_CODINGPLAN_BASE_URL,
        enabled: !!process.env.ALIYUN_CODINGPLAN_API_KEY,
        priority: parseInt(process.env.ALIYUN_CODINGPLAN_PRIORITY || '0', 10),
      },
      [AIProviderType.ZHIPU]: {
        apiKey: process.env.ZHIPU_API_KEY || '',
        model: process.env.ZHIPU_MODEL || 'glm-4-flash',
        enabled: !!process.env.ZHIPU_API_KEY,
        priority: parseInt(process.env.ZHIPU_PRIORITY || '1', 10),
      },
      [AIProviderType.DEEPSEEK]: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        enabled: !!process.env.DEEPSEEK_API_KEY,
        priority: parseInt(process.env.DEEPSEEK_PRIORITY || '2', 10),
      },
      [AIProviderType.OPENAI]: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        baseUrl: process.env.OPENAI_BASE_URL,
        enabled: !!process.env.OPENAI_API_KEY,
        priority: parseInt(process.env.OPENAI_PRIORITY || '3', 10),
      },
    }

    const fallbackEnabled = process.env.AI_FALLBACK_ENABLED !== 'false'
    const fallbackOrderEnv = process.env.AI_FALLBACK_ORDER || ''
    const fallbackOrder = fallbackOrderEnv
      ? fallbackOrderEnv.split(',').map((p) => this.parseProviderType(p.trim()))
      : this.getDefaultFallbackOrder(providers, defaultProvider)

    const rateLimit = {
      maxRequestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_RPM || '60', 10),
      maxTokensPerMinute: parseInt(process.env.AI_RATE_LIMIT_TPM || '90000', 10),
    }

    return {
      defaultProvider,
      providers,
      fallbackEnabled,
      fallbackOrder,
      rateLimit,
      costTracking: process.env.AI_COST_TRACKING !== 'false',
    }
  }

  private parseProviderType(value: string): AIProviderType {
    const mapping: Record<string, AIProviderType> = {
      aliyun_codingplan: AIProviderType.ALIYUN_CODINGPLAN,
      codingplan: AIProviderType.ALIYUN_CODINGPLAN,
      zhipu: AIProviderType.ZHIPU,
      glm: AIProviderType.ZHIPU,
      deepseek: AIProviderType.DEEPSEEK,
      openai: AIProviderType.OPENAI,
    }
    return mapping[value] || AIProviderType.OPENAI
  }

  private getDefaultFallbackOrder(
    providers: Record<AIProviderType, ProviderConfig>,
    defaultProvider: AIProviderType
  ): AIProviderType[] {
    const enabled = Object.entries(providers)
      .filter(([, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([type]) => type as AIProviderType)

    const withoutDefault = enabled.filter((p) => p !== defaultProvider)
    return [defaultProvider, ...withoutDefault]
  }

  getConfig(): AIConfig {
    return this.config
  }

  getDefaultProvider(): AIProviderType {
    return this.config.defaultProvider
  }

  getProviderConfig(provider: AIProviderType): ProviderConfig | undefined {
    return this.config.providers[provider]
  }

  getEnabledProviders(): AIProviderType[] {
    return Object.entries(this.config.providers)
      .filter(([, config]) => config.enabled)
      .map(([type]) => type as AIProviderType)
  }

  getFallbackOrder(): AIProviderType[] {
    return this.config.fallbackEnabled ? this.config.fallbackOrder : [this.config.defaultProvider]
  }

  getRateLimitConfig() {
    return this.config.rateLimit
  }

  isCostTrackingEnabled(): boolean {
    return this.config.costTracking
  }
}
