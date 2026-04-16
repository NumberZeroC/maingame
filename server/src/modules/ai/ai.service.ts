import { Injectable } from '@nestjs/common'
import { AICoreService } from './ai-core.service'
import {
  ChatMessage,
  TextGenerationOptions,
  ChatOptions,
  ImageGenerationOptions,
} from './interfaces'

@Injectable()
export class AiService {
  constructor(private readonly coreService: AICoreService) {}

  async generateText(prompt: string, options: TextGenerationOptions = {}): Promise<string> {
    const result = await this.coreService.generateText(prompt, options)
    return result.text
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const result = await this.coreService.chat(messages)
    return result.text
  }

  async chatWithOptions(messages: ChatMessage[], options?: ChatOptions) {
    return this.coreService.chat(messages, options)
  }

  async generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<string> {
    const result = await this.coreService.generateImage(prompt, options)
    return result.url
  }

  async generateTextWithDetails(prompt: string, options?: TextGenerationOptions) {
    return this.coreService.generateText(prompt, options)
  }

  async generateImageWithDetails(prompt: string, options?: ImageGenerationOptions) {
    return this.coreService.generateImage(prompt, options)
  }

  getUsageStats() {
    return this.coreService.getUsageStats()
  }

  getTotalCost() {
    return this.coreService.getTotalCost()
  }
}
