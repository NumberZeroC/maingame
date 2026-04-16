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
} from '../interfaces'
import { BaseAIProvider } from './base.provider'

export abstract class OpenAICompatibleProvider extends BaseAIProvider {
  abstract readonly name: string
  abstract readonly type: AIProviderType
  protected static MODELS: AIModel[] = []

  getDefaultModel(): string {
    return 'gpt-4o-mini'
  }

  getBaseUrl(): string {
    return 'https://api.openai.com/v1'
  }

  async generateText(
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<TextGenerationResult> {
    const messages: ChatMessage[] = [{ role: 'user', content: prompt }]
    return this.chat(messages, options)
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult> {
    const model = options?.model || this.defaultModel

    const systemMessage = options?.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }]
      : []

    try {
      const response = await this.client.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages: [
            ...systemMessage,
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: options?.maxTokens || 2000,
          temperature: options?.temperature ?? 0.7,
          top_p: options?.topP,
          stop: options?.stop,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const result = response.data
      const usage = result.usage || { prompt_tokens: 0, completion_tokens: 0 }
      const promptTokens = usage.prompt_tokens
      const completionTokens = usage.completion_tokens
      const cost = this.estimateCost(promptTokens, completionTokens, model)

      this.updateUsageStats(promptTokens, completionTokens, cost)

      return {
        text: result.choices?.[0]?.message?.content || '',
        model,
        provider: this.type,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        cost,
      }
    } catch (error: any) {
      this.handleError(error, 'Chat')
    }
  }

  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    const model = options?.model || this.getDefaultImageModel()

    if (!model) {
      throw new Error(`${this.name} does not support image generation`)
    }

    try {
      const response = await this.client.post(
        `${this.baseUrl}/images/generations`,
        {
          model,
          prompt,
          n: options?.n || 1,
          size: options?.size || '1024x1024',
          quality: options?.quality || 'standard',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const cost = this.getImageGenerationCost(model, options?.quality)

      return {
        url: response.data.data?.[0]?.url || '',
        model,
        provider: this.type,
        cost,
      }
    } catch (error: any) {
      this.handleError(error, 'Image generation')
    }
  }

  async listModels(): Promise<AIModel[]> {
    return (this.constructor as typeof OpenAICompatibleProvider).MODELS
  }

  getModelPricing(
    model: string
  ): { input: number; output: number; unit: 'per_1k_tokens' | 'per_1m_tokens' } | null {
    const models = (this.constructor as typeof OpenAICompatibleProvider).MODELS
    const found = models.find((m) => m.id === model)
    return found?.pricing || null
  }

  protected getDefaultImageModel(): string | null {
    const models = (this.constructor as typeof OpenAICompatibleProvider).MODELS
    const imageModel = models.find((m) => m.type === 'image')
    return imageModel?.id || null
  }

  protected getImageGenerationCost(model: string, quality?: string): number {
    const pricing: Record<string, Record<string, number>> = {
      'dall-e-3': { standard: 0.04, hd: 0.08 },
      'dall-e-2': { standard: 0.02, hd: 0.02 },
      'cogview-3': { standard: 0.05, hd: 0.05 },
    }

    return pricing[model]?.[quality || 'standard'] || 0.02
  }
}
