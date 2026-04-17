import { Test, TestingModule } from '@nestjs/testing'
import { AiService } from '../src/modules/ai/ai.service'
import { AICoreService } from '../src/modules/ai/ai-core.service'
import { AIProviderType } from '../src/modules/ai/interfaces'

describe('AiService (Unit)', () => {
  let service: AiService
  let coreService: jest.Mocked<AICoreService>

  beforeEach(async () => {
    const mockCoreService = {
      generateText: jest.fn(),
      chat: jest.fn(),
      generateImage: jest.fn(),
      getUsageStats: jest.fn(),
      getTotalCost: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService, { provide: AICoreService, useValue: mockCoreService }],
    }).compile()

    service = module.get<AiService>(AiService)
    coreService = module.get(AICoreService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generateText', () => {
    it('should call coreService.generateText and return text', async () => {
      coreService.generateText.mockResolvedValue({
        text: 'AI generated response',
        model: 'gpt-4o-mini',
        provider: AIProviderType.OPENAI,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: 0.001,
      })

      const result = await service.generateText('Hello AI')

      expect(result).toBe('AI generated response')
      expect(coreService.generateText).toHaveBeenCalledWith('Hello AI', {})
    })

    it('should pass options to coreService', async () => {
      coreService.generateText.mockResolvedValue({
        text: 'Short response',
        model: 'gpt-4o-mini',
        provider: AIProviderType.OPENAI,
        usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 },
        cost: 0.0005,
      })

      const result = await service.generateText('Hello', { maxTokens: 100, temperature: 0.5 })

      expect(coreService.generateText).toHaveBeenCalledWith('Hello', {
        maxTokens: 100,
        temperature: 0.5,
      })
    })
  })

  describe('chat', () => {
    it('should call coreService.chat and return text', async () => {
      coreService.chat.mockResolvedValue({
        text: 'Chat response',
        model: 'gpt-4o-mini',
        provider: AIProviderType.OPENAI,
        usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
        cost: 0.002,
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const result = await service.chat(messages)

      expect(result).toBe('Chat response')
      expect(coreService.chat).toHaveBeenCalledWith(messages)
    })

    it('should handle multiple messages', async () => {
      coreService.chat.mockResolvedValue({
        text: 'Response to conversation',
        model: 'gpt-4o-mini',
        provider: AIProviderType.OPENAI,
        usage: { promptTokens: 30, completionTokens: 20, totalTokens: 50 },
        cost: 0.003,
      })

      const messages = [
        { role: 'system' as const, content: 'You are helpful' },
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there' },
        { role: 'user' as const, content: 'How are you?' },
      ]
      const result = await service.chat(messages)

      expect(result).toBe('Response to conversation')
      expect(coreService.chat).toHaveBeenCalledWith(messages)
    })
  })

  describe('chatWithOptions', () => {
    it('should call coreService.chat with options', async () => {
      coreService.chat.mockResolvedValue({
        text: 'Custom response',
        model: 'gpt-4',
        provider: AIProviderType.OPENAI,
        usage: { promptTokens: 20, completionTokens: 30, totalTokens: 50 },
        cost: 0.01,
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const options = { model: 'gpt-4', temperature: 0.8 }
      const result = await service.chatWithOptions(messages, options)

      expect(result.text).toBe('Custom response')
      expect(result.model).toBe('gpt-4')
      expect(coreService.chat).toHaveBeenCalledWith(messages, options)
    })
  })

  describe('generateImage', () => {
    it('should call coreService.generateImage and return URL', async () => {
      coreService.generateImage.mockResolvedValue({
        url: 'https://example.com/generated-image.png',
        model: 'dall-e-3',
        provider: AIProviderType.OPENAI,
        cost: 0.04,
      })

      const result = await service.generateImage('A cute cat')

      expect(result).toBe('https://example.com/generated-image.png')
      expect(coreService.generateImage).toHaveBeenCalledWith('A cute cat', {})
    })

    it('should pass options to coreService', async () => {
      coreService.generateImage.mockResolvedValue({
        url: 'https://example.com/hd-image.png',
        model: 'dall-e-3',
        provider: AIProviderType.OPENAI,
        cost: 0.08,
      })

      const result = await service.generateImage('A dog', { size: '1024x1024', quality: 'hd' })

      expect(coreService.generateImage).toHaveBeenCalledWith('A dog', {
        size: '1024x1024',
        quality: 'hd',
      })
    })
  })

  describe('generateTextWithDetails', () => {
    it('should return full result object', async () => {
      const expectedResult = {
        text: 'Generated text',
        model: 'gpt-4o-mini',
        provider: AIProviderType.OPENAI,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: 0.001,
      }
      coreService.generateText.mockResolvedValue(expectedResult)

      const result = await service.generateTextWithDetails('Prompt')

      expect(result).toEqual(expectedResult)
      expect(result.usage.totalTokens).toBe(30)
      expect(result.cost).toBe(0.001)
    })
  })

  describe('generateImageWithDetails', () => {
    it('should return full result object', async () => {
      const expectedResult = {
        url: 'https://example.com/image.png',
        model: 'dall-e-3',
        provider: AIProviderType.OPENAI,
        cost: 0.04,
      }
      coreService.generateImage.mockResolvedValue(expectedResult)

      const result = await service.generateImageWithDetails('Prompt')

      expect(result).toEqual(expectedResult)
      expect(result.cost).toBe(0.04)
    })
  })

  describe('getUsageStats', () => {
    it('should return usage statistics', () => {
      const mockStats = [
        {
          provider: AIProviderType.OPENAI,
          model: 'gpt-4o-mini',
          requestCount: 10,
          totalPromptTokens: 100,
          totalCompletionTokens: 200,
          totalCost: 0.5,
          lastUsed: new Date(),
        },
      ]
      coreService.getUsageStats.mockReturnValue(mockStats)

      const result = service.getUsageStats()

      expect(result).toEqual(mockStats)
      expect(coreService.getUsageStats).toHaveBeenCalled()
    })

    it('should return empty array when no stats', () => {
      coreService.getUsageStats.mockReturnValue([])

      const result = service.getUsageStats()

      expect(result).toEqual([])
    })
  })

  describe('getTotalCost', () => {
    it('should return total cost', () => {
      coreService.getTotalCost.mockReturnValue(1.23)

      const result = service.getTotalCost()

      expect(result).toBe(1.23)
      expect(coreService.getTotalCost).toHaveBeenCalled()
    })

    it('should return 0 when no cost', () => {
      coreService.getTotalCost.mockReturnValue(0)

      const result = service.getTotalCost()

      expect(result).toBe(0)
    })
  })
})
