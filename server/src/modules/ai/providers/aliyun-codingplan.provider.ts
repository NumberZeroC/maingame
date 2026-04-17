import {
  AIProviderType,
  AIModel,
  ChatMessage,
  ChatOptions,
  ChatResult,
  ImageGenerationOptions,
  ImageGenerationResult,
} from '../interfaces'
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
      id: 'wanx-v1',
      name: 'Wanx V1 (Image Generation)',
      provider: AIProviderType.ALIYUN_CODINGPLAN,
      type: 'image',
      maxTokens: 0,
      pricing: { input: 0.08, output: 0, unit: 'per_image' },
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
  ): {
    input: number
    output: number
    unit: 'per_1k_tokens' | 'per_1m_tokens' | 'per_image'
  } | null {
    const found = AliyunCodingPlanProvider.MODELS.find((m) => m.id === model)
    return found?.pricing || null
  }

  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    const model = options?.model || 'wanx-v1'

    try {
      const response = await this.client.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        {
          model,
          input: { prompt },
          parameters: {
            style: options?.style || '<auto>',
            size: options?.size || '1024*1024',
            n: options?.n || 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'X-DashScope-Async': 'enable',
          },
        }
      )

      const taskId = response.data.output?.task_id
      if (taskId) {
        const resultUrl = await this.waitForImageTask(taskId)
        return {
          url: resultUrl,
          model,
          provider: this.type,
          cost: 0.08,
        }
      }

      throw new Error('Image generation failed: no task_id returned')
    } catch (error: any) {
      this.handleError(error, 'Image generation')
    }
  }

  private async waitForImageTask(taskId: string): Promise<string> {
    const maxAttempts = 30
    const delayMs = 2000

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.client.get(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
          }
        )

        if (response.data.output?.task_status === 'SUCCEEDED') {
          return response.data.output.results?.[0]?.url || ''
        }

        if (response.data.output?.task_status === 'FAILED') {
          throw new Error('Image generation task failed')
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs))
      } catch (error: any) {
        if (i === maxAttempts - 1) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    throw new Error('Image generation timeout')
  }
}
