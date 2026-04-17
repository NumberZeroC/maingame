import { Test, TestingModule } from '@nestjs/testing'
import { DrawGuessService } from '../src/modules/games/draw-guess/draw-guess.service'
import { getModelToken } from '@nestjs/mongoose'
import { DrawGuessGame } from '../src/modules/games/draw-guess/draw-guess.schema'
import { AiService } from '../src/modules/ai/ai.service'

describe('DrawGuessService', () => {
  let service: DrawGuessService
  let mockModel: any
  let aiService: jest.Mocked<AiService>

  const mockGame = {
    _id: 'game-id-123',
    word: '猫',
    category: 'animals',
    imageUrl: 'https://example.com/cat.png',
    userId: 'user-id-123',
    status: 'playing',
    score: 0,
    attempts: 0,
    guesses: [],
    timeLimit: 60,
    timeRemaining: 60,
    startedAt: new Date(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    mockModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }

    const mockAiService = {
      generateImage: jest.fn(),
      generateText: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawGuessService,
        { provide: getModelToken(DrawGuessGame.name), useValue: mockModel },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile()

    service = module.get<DrawGuessService>(DrawGuessService)
    aiService = module.get(AiService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('startGame', () => {
    it('should start a game with random category', async () => {
      aiService.generateImage.mockResolvedValue('https://ai-generated.com/cat.png')
      mockModel.save = jest.fn().mockResolvedValue(mockGame)

      const mockGameInstance = {
        ...mockGame,
        save: jest.fn().mockResolvedValue(mockGame),
      }
      mockModel.mockImplementation = jest.fn(() => mockGameInstance)
      ;(service as any).gameModel = Object.assign(function () {
        return mockGameInstance
      }, mockModel)

      const result = await service.startGame('user-id-123')

      expect(aiService.generateImage).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should start a game with specified category', async () => {
      aiService.generateImage.mockResolvedValue('https://ai-generated.com/dog.png')

      const mockGameInstance = {
        ...mockGame,
        word: '狗',
        category: 'animals',
        save: jest.fn().mockResolvedValue({ ...mockGame, word: '狗', category: 'animals' }),
      }
      ;(service as any).gameModel = Object.assign(function () {
        return mockGameInstance
      }, mockModel)

      const result = await service.startGame('user-id-123', 'animals')

      expect(result).toBeDefined()
    })

    it('should use placeholder image if AI generation fails', async () => {
      aiService.generateImage.mockRejectedValue(new Error('AI failed'))

      const mockGameInstance = {
        ...mockGame,
        imageUrl: 'https://picsum.photos/seed/猫/400/300',
        save: jest.fn().mockResolvedValue(mockGame),
      }
      ;(service as any).gameModel = Object.assign(function () {
        return mockGameInstance
      }, mockModel)

      const result = await service.startGame('user-id-123')

      expect(result.imageUrl).toContain('picsum.photos')
    })
  })

  describe('guess', () => {
    it('should return correct when guess matches word', async () => {
      const gameWithGuesses = {
        ...mockGame,
        guesses: ['狗'],
        attempts: 1,
        word: '猫',
        save: jest.fn().mockResolvedValue({
          ...mockGame,
          status: 'completed',
          score: 100,
        }),
      }
      mockModel.findOne.mockResolvedValue(gameWithGuesses)

      const result = await service.guess('game-id-123', 'user-id-123', '猫')

      expect(result.correct).toBe(true)
      expect(result.message).toBe('恭喜你猜对了！')
      expect(gameWithGuesses.save).toHaveBeenCalled()
    })

    it('should return incorrect with hint when guess does not match', async () => {
      const gameWithGuesses = {
        ...mockGame,
        guesses: [],
        attempts: 0,
        word: '猫',
        save: jest.fn().mockResolvedValue(mockGame),
      }
      mockModel.findOne.mockResolvedValue(gameWithGuesses)

      const result = await service.guess('game-id-123', 'user-id-123', '狗')

      expect(result.correct).toBe(false)
      expect(result.message).toContain('提示')
      expect(result.game.attempts).toBe(1)
    })

    it('should throw error when game not found', async () => {
      mockModel.findOne.mockResolvedValue(null)

      await expect(service.guess('non-existent', 'user-id-123', '猫')).rejects.toThrow(
        'Game not found or already completed'
      )
    })

    it('should throw error when game already completed', async () => {
      mockModel.findOne.mockResolvedValue(null)

      await expect(service.guess('game-id-123', 'user-id-123', '猫')).rejects.toThrow()
    })

    it('should calculate score based on attempts', async () => {
      const gameWithGuesses = {
        ...mockGame,
        guesses: ['狗', '兔'],
        attempts: 2,
        word: '猫',
        save: jest.fn().mockResolvedValue({
          ...mockGame,
          status: 'completed',
          score: 90,
        }),
      }
      mockModel.findOne.mockResolvedValue(gameWithGuesses)

      const result = await service.guess('game-id-123', 'user-id-123', '猫')

      expect(result.game.score).toBeGreaterThanOrEqual(10)
    })

    it('should provide first letter hint at attempt 3', async () => {
      const gameWithGuesses = {
        ...mockGame,
        guesses: ['狗', '兔'],
        attempts: 2,
        word: '猫',
        save: jest.fn().mockResolvedValue(mockGame),
      }
      mockModel.findOne.mockResolvedValue(gameWithGuesses)

      const result = await service.guess('game-id-123', 'user-id-123', '虎')

      expect(result.message).toContain('第一个字是')
    })

    it('should provide partial answer hint at attempt 5+', async () => {
      const gameWithGuesses = {
        ...mockGame,
        guesses: ['狗', '兔', '虎', '狮'],
        attempts: 4,
        word: '猫',
        save: jest.fn().mockResolvedValue(mockGame),
      }
      mockModel.findOne.mockResolvedValue(gameWithGuesses)

      const result = await service.guess('game-id-123', 'user-id-123', '熊')

      expect(result.message).toContain('○')
    })
  })

  describe('finishGame', () => {
    it('should mark game as timeout', async () => {
      const playingGame = {
        ...mockGame,
        status: 'playing',
        save: jest.fn().mockResolvedValue({
          ...mockGame,
          status: 'timeout',
          timeRemaining: 30,
        }),
      }
      mockModel.findOne.mockResolvedValue(playingGame)

      const result = await service.finishGame('game-id-123', 'user-id-123', 30)

      expect(result.status).toBe('timeout')
      expect(result.timeRemaining).toBe(30)
    })

    it('should throw error when game not found', async () => {
      mockModel.findOne.mockResolvedValue(null)

      await expect(service.finishGame('non-existent', 'user-id-123', 30)).rejects.toThrow(
        'Game not found or already completed'
      )
    })
  })

  describe('getGame', () => {
    it('should return game by id', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockGame),
      })

      const result = await service.getGame('game-id-123')

      expect(result).toEqual(mockGame)
    })

    it('should return null when game not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })

      const result = await service.getGame('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getUserGames', () => {
    it('should return user game history', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockGame]),
          }),
        }),
      })

      const result = await service.getUserGames('user-id-123', 10)

      expect(result).toEqual([mockGame])
      expect(mockModel.find).toHaveBeenCalledWith({ userId: 'user-id-123' })
    })

    it('should limit results', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockGame]),
          }),
        }),
      })

      await service.getUserGames('user-id-123', 5)

      expect(mockModel.find().sort().limit).toHaveBeenCalledWith(5)
    })
  })

  describe('getLeaderboard', () => {
    it('should return top games sorted by score', async () => {
      const topGames = [
        { ...mockGame, score: 150, status: 'completed' },
        { ...mockGame, score: 120, status: 'completed' },
        { ...mockGame, score: 100, status: 'completed' },
      ]
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(topGames),
          }),
        }),
      })

      const result = await service.getLeaderboard(10)

      expect(result).toEqual(topGames)
      expect(mockModel.find).toHaveBeenCalledWith({ status: 'completed' })
    })

    it('should filter by completed status', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      await service.getLeaderboard(10)

      expect(mockModel.find).toHaveBeenCalledWith({ status: 'completed' })
    })
  })

  describe('getRandomWord', () => {
    it('should return word from specified category', () => {
      const result = (service as any).getRandomWord('animals')

      expect(result.category).toBe('animals')
      expect([
        '猫',
        '狗',
        '兔子',
        '老虎',
        '狮子',
        '大象',
        '长颈鹿',
        '熊猫',
        '企鹅',
        '海豚',
        '蝴蝶',
        '蜜蜂',
        '狐狸',
        '熊',
      ]).toContain(result.word)
    })

    it('should return word from random category when not specified', () => {
      const result = (service as any).getRandomWord()

      expect(['animals', 'plants', 'objects', 'food', 'nature']).toContain(result.category)
    })
  })

  describe('getHint', () => {
    it('should return length hint at attempt 1', () => {
      const hint = (service as any).getHint('猫', 1)

      expect(hint).toContain('1个字')
    })

    it('should return first letter hint at attempt 3', () => {
      const hint = (service as any).getHint('大象', 3)

      expect(hint).toContain('第一个字是"大"')
    })

    it('should return partial answer hint at attempt 5+', () => {
      const hint = (service as any).getHint('熊猫', 5)

      expect(hint).toContain('熊')
      expect(hint).toContain('○')
    })

    it('should return empty string at attempt 2', () => {
      const hint = (service as any).getHint('猫', 2)

      expect(hint).toBe('')
    })
  })
})
