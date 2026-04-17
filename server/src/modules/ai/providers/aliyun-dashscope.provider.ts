import {
  AIProviderType,
  AIModel,
  ImageGenerationOptions,
  ImageGenerationResult,
} from '../interfaces'
import { BaseAIProvider } from './base.provider'

export class AliyunDashScopeProvider extends BaseAIProvider {
  readonly name = 'Aliyun DashScope'
  readonly type = AIProviderType.ALIYUN_CODINGPLAN

  static readonly IMAGE_MODELS: AIModel[] = [
    {
      id: 'wan2.7-image',
      name: 'Wan 2.7 Image',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'image',
      maxTokens: 1024,
    },
    {
      id: 'wan2.7-image-pro',
      name: 'Wan 2.7 Image Pro',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'image',
      maxTokens: 1024,
    },
    {
      id: 'qwen-image-2.0-pro',
      name: 'Qwen Image 2.0 Pro',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'image',
      maxTokens: 1024,
    },
    {
      id: 'qwen-image-2.0',
      name: 'Qwen Image 2.0',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'image',
      maxTokens: 1024,
    },
    {
      id: 'qwen-image-2.0-2026-03-03',
      name: 'Qwen Image 2.0 (2026)',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'image',
      maxTokens: 1024,
    },
  ]

  private fallbackModels: string[] = []

  constructor(apiKey: string, baseUrl?: string, fallbackModels?: string[]) {
    super(apiKey, undefined, 'wan2.7-image', baseUrl || 'https://dashscope.aliyuncs.com/api/v1')
    this.fallbackModels = fallbackModels || [
      'wan2.7-image-pro',
      'qwen-image-2.0-pro',
      'qwen-image-2.0',
      'qwen-image-2.0-2026-03-03',
    ]
  }

  getDefaultModel(): string {
    return 'wan2.7-image'
  }

  getBaseUrl(): string {
    return 'https://dashscope.aliyuncs.com/api/v1'
  }

  async listModels(): Promise<AIModel[]> {
    return AliyunDashScopeProvider.IMAGE_MODELS
  }

  getModelPricing(
    model: string
  ): { input: number; output: number; unit: 'per_1k_tokens' | 'per_1m_tokens' } | null {
    return { input: 0, output: 0, unit: 'per_1k_tokens' }
  }

  async generateText(): Promise<any> {
    throw new Error('DashScope provider only supports image generation')
  }

  async chat(): Promise<any> {
    throw new Error('DashScope provider only supports image generation')
  }

  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    const modelsToTry = [options?.model || this.defaultModel, ...this.fallbackModels]

    for (const model of modelsToTry) {
      try {
        const result = await this.tryGenerateImage(prompt, model, options)
        if (result) {
          console.log(`Image generation succeeded with model: ${model}`)
          return result
        }
      } catch (error: any) {
        console.log(`Model ${model} failed: ${error.message}, trying next...`)
      }
    }

    throw new Error('All image models failed')
  }

  private async tryGenerateImage(
    prompt: string,
    model: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult | null> {
    try {
      const response = await this.client.post(
        `${this.baseUrl}/services/aigc/text2image/image-synthesis`,
        {
          model,
          input: { prompt },
          parameters: {
            size: options?.size || '1024*1024',
            n: options?.n || 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable',
          },
        }
      )

      const taskId = response.data.output?.task_id
      if (!taskId) {
        if (response.data.output?.results?.[0]?.url) {
          return {
            url: response.data.output.results[0].url,
            model,
            provider: this.type,
            cost: 0,
          }
        }
        throw new Error('No task_id or direct result returned')
      }

      const resultUrl = await this.waitForTask(taskId)
      return {
        url: resultUrl,
        model,
        provider: this.type,
        cost: 0,
      }
    } catch (error: any) {
      throw error
    }
  }

  private async waitForTask(taskId: string): Promise<string> {
    const maxAttempts = 60
    const delayMs = 2000

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.client.get(`${this.baseUrl}/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        })

        const status = response.data.output?.task_status

        if (status === 'SUCCEEDED') {
          return response.data.output.results?.[0]?.url || ''
        }

        if (status === 'FAILED') {
          const message = response.data.output?.message || 'Unknown error'
          throw new Error(`Task failed: ${message}`)
        }

        if (status === 'PENDING' || status === 'RUNNING') {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
          continue
        }

        throw new Error(`Unknown task status: ${status}`)
      } catch (error: any) {
        if (i === maxAttempts - 1) {
          throw new Error(`Timeout waiting for image: ${error.message}`)
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    throw new Error('Image generation timeout')
  }
}
