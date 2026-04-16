import { AIProviderType, AIModel } from '../interfaces'
import { OpenAICompatibleProvider } from './openai-compatible.provider'

export class DeepSeekProvider extends OpenAICompatibleProvider {
  readonly name = 'DeepSeek'
  readonly type = AIProviderType.DEEPSEEK

  static readonly MODELS: AIModel[] = [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: AIProviderType.DEEPSEEK,
      type: 'chat',
      maxTokens: 4096,
      pricing: { input: 0.001, output: 0.002, unit: 'per_1k_tokens' },
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      provider: AIProviderType.DEEPSEEK,
      type: 'chat',
      maxTokens: 4096,
      pricing: { input: 0.001, output: 0.002, unit: 'per_1k_tokens' },
    },
  ]

  getDefaultModel(): string {
    return 'deepseek-chat'
  }

  getBaseUrl(): string {
    return 'https://api.deepseek.com/v1'
  }
}
