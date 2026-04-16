import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'
import * as path from 'path'
import { AIProviderType, AIConfig, ProviderConfig } from './interfaces'

interface ModelConfig {
  id: string
  name: string
  maxTokens: number
  thinking?: { type: string; budgetTokens: number } | false
  pricing: { input: number; output: number; unit: string }
}

interface ProviderFileConfig {
  name: string
  apiKey: string
  baseUrl: string
  models: ModelConfig[]
}

interface AIProvidersFileConfig {
  currentProvider: string
  currentModel: string
  providers: Record<string, ProviderFileConfig>
}

interface CodingPlanFileConfig {
  enabled: boolean
  currentModel: string
  apiKey: string
  baseUrl: string
  models: ModelConfig[]
}

@Injectable()
export class AIConfigFileService {
  private readonly logger = new Logger(AIConfigFileService.name)
  private config: AIConfig
  private configFileDir: string

  constructor(private configService: ConfigService) {
    this.configFileDir = process.env.AI_CONFIG_DIR || path.join(process.cwd(), 'config')
    this.config = this.loadConfigFromFiles()
  }

  private loadConfigFromFiles(): AIConfig {
    const codingplanConfig = this.loadCodingPlanConfig()
    const providersConfig = this.loadAIProvidersConfig()

    const providers: Record<AIProviderType, ProviderConfig> = {
      [AIProviderType.ALIYUN_CODINGPLAN]: {
        apiKey: codingplanConfig?.apiKey || '',
        model: codingplanConfig?.currentModel || 'glm-5',
        baseUrl: codingplanConfig?.baseUrl,
        enabled: (codingplanConfig?.enabled && !!codingplanConfig?.apiKey) || false,
        priority: 0,
      },
      [AIProviderType.ZHIPU]: {
        apiKey: providersConfig?.providers?.zhipu?.apiKey || '',
        model: providersConfig?.providers?.zhipu?.models?.[0]?.id || 'glm-4-flash',
        baseUrl: providersConfig?.providers?.zhipu?.baseUrl,
        enabled: !!providersConfig?.providers?.zhipu?.apiKey,
        priority: 1,
      },
      [AIProviderType.DEEPSEEK]: {
        apiKey: providersConfig?.providers?.deepseek?.apiKey || '',
        model: providersConfig?.providers?.deepseek?.models?.[0]?.id || 'deepseek-chat',
        baseUrl: providersConfig?.providers?.deepseek?.baseUrl,
        enabled: !!providersConfig?.providers?.deepseek?.apiKey,
        priority: 2,
      },
      [AIProviderType.OPENAI]: {
        apiKey: providersConfig?.providers?.openai?.apiKey || '',
        model: providersConfig?.providers?.openai?.models?.[0]?.id || 'gpt-4o-mini',
        baseUrl: providersConfig?.providers?.openai?.baseUrl,
        enabled: !!providersConfig?.providers?.openai?.apiKey,
        priority: 3,
      },
    }

    let defaultProvider = AIProviderType.ALIYUN_CODINGPLAN
    if (codingplanConfig?.enabled) {
      defaultProvider = AIProviderType.ALIYUN_CODINGPLAN
    } else if (providersConfig?.currentProvider) {
      const mapping: Record<string, AIProviderType> = {
        openai: AIProviderType.OPENAI,
        deepseek: AIProviderType.DEEPSEEK,
        zhipu: AIProviderType.ZHIPU,
      }
      defaultProvider = mapping[providersConfig.currentProvider] || AIProviderType.ALIYUN_CODINGPLAN
    }

    const enabledProviders = Object.entries(providers)
      .filter(([, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([type]) => type as AIProviderType)

    const fallbackOrder = [
      defaultProvider,
      ...enabledProviders.filter((p) => p !== defaultProvider),
    ]

    return {
      defaultProvider,
      providers,
      fallbackEnabled: true,
      fallbackOrder,
      rateLimit: {
        maxRequestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_RPM || '60', 10),
        maxTokensPerMinute: parseInt(process.env.AI_RATE_LIMIT_TPM || '90000', 10),
      },
      costTracking: process.env.AI_COST_TRACKING !== 'false',
    }
  }

  private loadCodingPlanConfig(): CodingPlanFileConfig | null {
    const filePath = path.join(this.configFileDir, 'codingplan.json')
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`CodingPlan config file not found: ${filePath}`)
      return null
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      this.logger.error(`Failed to load CodingPlan config: ${error}`)
      return null
    }
  }

  private loadAIProvidersConfig(): AIProvidersFileConfig | null {
    const filePath = path.join(this.configFileDir, 'ai-providers.json')
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`AI providers config file not found: ${filePath}`)
      return null
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      this.logger.error(`Failed to load AI providers config: ${error}`)
      return null
    }
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

  isCodingPlanEnabled(): boolean {
    return this.config.providers[AIProviderType.ALIYUN_CODINGPLAN]?.enabled || false
  }

  getCurrentCodingPlanModel(): string {
    return this.config.providers[AIProviderType.ALIYUN_CODINGPLAN]?.model || 'glm-5'
  }

  reloadConfig(): void {
    this.config = this.loadConfigFromFiles()
    this.logger.log('AI config reloaded from files')
  }
}
