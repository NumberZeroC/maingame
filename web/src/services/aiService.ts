import { api } from '../lib/api'
import {
  GenerateTextRequest,
  GenerateTextResponse,
  ChatRequest,
  ChatResponse,
  GenerateImageRequest,
  GenerateImageResponse,
} from '../types'

export const aiService = {
  async generateText(data: GenerateTextRequest): Promise<GenerateTextResponse> {
    const response = await api.post<GenerateTextResponse>('/ai/text/generate', data)
    return response.data
  },

  async chat(data: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/ai/chat', data)
    return response.data
  },

  async generateImage(data: GenerateImageRequest): Promise<GenerateImageResponse> {
    const response = await api.post<GenerateImageResponse>('/ai/image/generate', data)
    return response.data
  },
}
