import { AIProviderType, AIModel, ChatMessage, ChatOptions, ChatResult } from '../interfaces'
import { OpenAICompatibleProvider } from './openai-compatible.provider'

export class AliyunCodingPlanProvider extends OpenAICompatibleProvider {
  readonly name = 'Aliyun CodingPlan'
  readonly type = AIProviderType.ALIYUN_CODINGPLAN

  static readonly MODELS: AIModel[] = [
    {
      id: 'qwen3-coder-plus',
      name: 'Qwen3 Coder Plus',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 65536,
      pricing: { input: 0.0035, output: 0.007, unit: 'per_1k_tokens' },
    },
    {
      id: 'qwen3.5-plus',
      name: 'Qwen3.5 Plus',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 65536,
      pricing: { input: 0.002, output: 0.006, unit: 'per_1k_tokens' },
    },
    {
      id: 'qwen3-max-2026-01-23',
      name: 'Qwen3 Max',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 32768,
      pricing: { input: 0.004, output: 0.008, unit: 'per_1k_tokens' },
    },
    {
      id: 'glm-5',
      name: 'GLM-5',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 16384,
      pricing: { input: 0.001, output: 0.001, unit: 'per_1k_tokens' },
    },
    {
      id: 'glm-4.7',
      name: 'GLM-4.7',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 16384,
      pricing: { input: 0.001, output: 0.001, unit: 'per_1k_tokens' },
    },
    {
      id: 'MiniMax-M2.5',
      name: 'MiniMax M2.5',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 24576,
      pricing: { input: 0.002, output: 0.002, unit: 'per_1k_tokens' },
    },
    {
      id: 'kimi-k2.5',
      name: 'Kimi K2.5',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 32768,
      pricing: { input: 0.003, output: 0.003, unit: 'per_1k_tokens' },
    },
  ]

  getDefaultModel(): string {
    return 'qwen3-coder-plus'
  }

  getBaseUrl(): string {
    return 'https://coding.dashscope.aliyuncs.com/v1'
  }

  async listModels(): Promise<AIModel[]> {
    return AliyunCodingPlanProvider.MODELS
  }

  getModelPricing(
    model: string
  ): { input: number; output: number; unit: 'per_1k_tokens' | 'per_1m_tokens' } | null {
    const found = AliyunCodingPlanProvider.MODELS.find((m) => m.id === model)
    return found?.pricing || null
  }
}
