import { Test, TestingModule } from '@nestjs/testing'
import { SpeechService } from '../src/modules/ai/speech.service'
import { ConfigService } from '@nestjs/config'

describe('SpeechService', () => {
  let service: SpeechService
  let configService: ConfigService

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeechService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<SpeechService>(SpeechService)
    configService = module.get(ConfigService)
  })

  describe('textToSpeech', () => {
    it('should return mock result when no provider configured', async () => {
      const result = await service.textToSpeech('Hello world')

      expect(result).toHaveProperty('audioUrl')
      expect(result).toHaveProperty('duration')
      expect(result.duration).toBeGreaterThan(0)
    })

    it('should accept voice options', async () => {
      const result = await service.textToSpeech('Hello', {
        voice: 'male',
        speed: 1.5,
        format: 'wav',
      })

      expect(result).toHaveProperty('audioUrl')
    })

    it('should calculate duration based on text length', async () => {
      const shortText = 'Hi'
      const longText = 'This is a much longer text that should have a longer duration'

      const shortResult = await service.textToSpeech(shortText)
      const longResult = await service.textToSpeech(longText)

      expect(longResult.duration).toBeGreaterThan(shortResult.duration)
    })
  })

  describe('speechToText', () => {
    it('should return mock result when no provider configured', async () => {
      const result = await service.speechToText('mock-audio-data')

      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('confidence')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should accept language option', async () => {
      const result = await service.speechToText('audio-data', {
        language: 'en-US',
      })

      expect(result).toHaveProperty('text')
    })
  })
})