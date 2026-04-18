import { Test, TestingModule } from '@nestjs/testing'
import { StreamService } from '../src/modules/ai/stream.service'
import { AICoreService } from '../src/modules/ai/ai-core.service'

describe('StreamService', () => {
  let service: StreamService
  let aiCoreService: AICoreService

  beforeEach(async () => {
    const mockAICoreService = {
      generateText: jest.fn().mockResolvedValue({ text: 'Hello world this is a test' }),
      chat: jest.fn().mockResolvedValue({ text: 'Hello from chat' }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamService,
        { provide: AICoreService, useValue: mockAICoreService },
      ],
    }).compile()

    service = module.get<StreamService>(StreamService)
    aiCoreService = module.get(AICoreService)
  })

  describe('streamText', () => {
    it('should return full text', async () => {
      const result = await service.streamText('Test prompt')

      expect(result).toBe('Hello world this is a test')
    })

    it('should pass options to AI service', async () => {
      await service.streamText('Test', { maxTokens: 100 })

      expect(aiCoreService.generateText).toHaveBeenCalledWith('Test', { maxTokens: 100 })
    })
  })

  describe('streamChat', () => {
    it('should return chat response', async () => {
      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const result = await service.streamChat(messages)

      expect(result).toBe('Hello from chat')
    })
  })

  describe('createTextStream', () => {
    it('should create observable stream', (done) => {
      const stream = service.createTextStream('Test')

      let chunksReceived = 0
      let lastChunk = ''

      stream.subscribe({
        next: (chunk) => {
          chunksReceived++
          lastChunk = chunk.text
        },
        complete: () => {
          expect(chunksReceived).toBeGreaterThan(1)
          expect(lastChunk).toBe('Hello world this is a test')
          done()
        },
        error: done,
      })
    })
  })

  describe('simulateStream', () => {
    it('should simulate streaming with word chunks', (done) => {
      const text = 'Hello world test'
      const stream = service.simulateStream(text, 10)

      let chunksReceived = 0

      stream.subscribe({
        next: (chunk) => {
          chunksReceived++
          if (!chunk.done) {
            expect(chunk.text.length).toBeLessThanOrEqual(text.length)
          }
        },
        complete: () => {
          expect(chunksReceived).toBeGreaterThan(1)
          done()
        },
        error: done,
      })
    })
  })
})