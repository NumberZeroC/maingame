import { AIProviderType, AIModel } from '../interfaces'
import { OpenAICompatibleProvider } from './openai-compatible.provider'

export class AliyunCodingPlanProvider extends OpenAICompatibleProvider {
  readonly name = 'Aliyun CodingPlan'
  readonly type = AIProviderType.ALIYUN_CODINGPLAN

  static readonly MODELS: AIModel[] = [
    {
      id: 'qwen-coder-plus',
      name: 'Qwen Coder Plus',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 32768,
      pricing: { input: 0.0035, output: 0.007, unit: 'per_1k_tokens' },
    },
    {
      id: 'qwen-coder-turbo',
      name: 'Qwen Coder Turbo',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 8192,
      pricing: { input: 0.002, output: 0.006, unit: 'per_1k_tokens' },
    },
    {
      id: 'glm-5',
      name: 'GLM-5',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 8192,
      pricing: { input: 0.001, output: 0.001, unit: 'per_1k_tokens' },
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'chat',
      maxTokens: 16384,
      pricing: { input: 0.0007, output: 0.0007, unit: 'per_1k_tokens' },
    },
  ]

  getDefaultModel(): string {
    return 'glm-5'
  }

  getBaseUrl(): string {
    return 'https://open.bigmodel.cn/api/paas/v4'
  }
}
