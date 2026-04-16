import { AIProviderType, AIModel } from '../interfaces'
import { OpenAICompatibleProvider } from './openai-compatible.provider'

export class ZhipuProvider extends OpenAICompatibleProvider {
  readonly name = 'Zhipu GLM'
  readonly type = AIProviderType.ZHIPU

  static readonly MODELS: AIModel[] = [
    {
      id: 'glm-4',
      name: 'GLM-4',
      provider: AIProviderType.ZHIPU,
      type: 'chat',
      maxTokens: 8192,
      pricing: { input: 0.1, output: 0.1, unit: 'per_1k_tokens' },
    },
    {
      id: 'glm-4-air',
      name: 'GLM-4-Air',
      provider: AIProviderType.ZHIPU,
      type: 'chat',
      maxTokens: 8192,
      pricing: { input: 0.001, output: 0.001, unit: 'per_1k_tokens' },
    },
    {
      id: 'glm-4-flash',
      name: 'GLM-4-Flash',
      provider: AIProviderType.ZHIPU,
      type: 'chat',
      maxTokens: 8192,
      pricing: { input: 0.0001, output: 0.0001, unit: 'per_1k_tokens' },
    },
    {
      id: 'glm-3-turbo',
      name: 'GLM-3 Turbo',
      provider: AIProviderType.ZHIPU,
      type: 'chat',
      maxTokens: 4096,
      pricing: { input: 0.001, output: 0.001, unit: 'per_1k_tokens' },
    },
    {
      id: 'cogview-3',
      name: 'CogView-3',
      provider: AIProviderType.ZHIPU,
      type: 'image',
      maxTokens: 1024,
    },
  ]

  getDefaultModel(): string {
    return 'glm-4-flash'
  }

  getBaseUrl(): string {
    return 'https://open.bigmodel.cn/api/paas/v4'
  }
}
