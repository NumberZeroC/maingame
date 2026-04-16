import { AIProviderType, AIModel } from '../interfaces'
import { OpenAICompatibleProvider } from './openai-compatible.provider'

export class OpenAIProvider extends OpenAICompatibleProvider {
  readonly name = 'OpenAI'
  readonly type = AIProviderType.OPENAI

  static readonly MODELS: AIModel[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: AIProviderType.OPENAI,
      type: 'chat',
      maxTokens: 128000,
      pricing: { input: 0.005, output: 0.015, unit: 'per_1k_tokens' },
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: AIProviderType.OPENAI,
      type: 'chat',
      maxTokens: 128000,
      pricing: { input: 0.00015, output: 0.0006, unit: 'per_1k_tokens' },
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: AIProviderType.OPENAI,
      type: 'chat',
      maxTokens: 128000,
      pricing: { input: 0.01, output: 0.03, unit: 'per_1k_tokens' },
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: AIProviderType.OPENAI,
      type: 'chat',
      maxTokens: 8192,
      pricing: { input: 0.03, output: 0.06, unit: 'per_1k_tokens' },
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: AIProviderType.OPENAI,
      type: 'chat',
      maxTokens: 16384,
      pricing: { input: 0.0005, output: 0.0015, unit: 'per_1k_tokens' },
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      provider: AIProviderType.OPENAI,
      type: 'image',
      maxTokens: 4096,
    },
    {
      id: 'dall-e-2',
      name: 'DALL-E 2',
      provider: AIProviderType.OPENAI,
      type: 'image',
      maxTokens: 1024,
    },
  ]

  getDefaultModel(): string {
    return 'gpt-4o-mini'
  }

  getBaseUrl(): string {
    return 'https://api.openai.com/v1'
  }
}
