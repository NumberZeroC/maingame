import { Test, TestingModule } from '@nestjs/testing'
import { DrawGuessController } from '../src/modules/games/draw-guess/draw-guess.controller'
import { DrawGuessService } from '../src/modules/games/draw-guess/draw-guess.service'

describe('DrawGuessController', () => {
  let controller: DrawGuessController
  let service: jest.Mocked<DrawGuessService>

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
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRequest = {
    user: {
      id: 'user-id-123',
      phone: '13800138000',
    },
  }

  beforeEach(async () => {
    const mockService = {
      startGame: jest.fn(),
      guess: jest.fn(),
      finishGame: jest.fn(),
      getGame: jest.fn(),
      getUserGames: jest.fn(),
      getLeaderboard: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrawGuessController],
      providers: [{ provide: DrawGuessService, useValue: mockService }],
    }).compile()

    controller = module.get<DrawGuessController>(DrawGuessController)
    service = module.get(DrawGuessService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('startGame', () => {
    it('should start a game without category', async () => {
      service.startGame.mockResolvedValue(mockGame as any)

      const result = await controller.startGame(mockRequest, {})

      expect(result).toEqual(mockGame)
      expect(service.startGame).toHaveBeenCalledWith('user-id-123', undefined)
    })

    it('should start a game with specified category', async () => {
      service.startGame.mockResolvedValue(mockGame as any)

      const result = await controller.startGame(mockRequest, { category: 'animals' })

      expect(result).toEqual(mockGame)
      expect(service.startGame).toHaveBeenCalledWith('user-id-123', 'animals')
    })

    it('should pass user id from request', async () => {
      service.startGame.mockResolvedValue(mockGame as any)

      await controller.startGame(mockRequest, {})

      expect(service.startGame).toHaveBeenCalledWith(mockRequest.user.id, undefined)
    })
  })

  describe('guess', () => {
    it('should submit guess and return result', async () => {
      const guessResult = {
        correct: true,
        message: '恭喜你猜对了！',
        game: mockGame,
      }
      service.guess.mockResolvedValue(guessResult as any)

      const result = await controller.guess('game-id-123', mockRequest, { guess: '猫' })

      expect(result).toEqual(guessResult)
      expect(service.guess).toHaveBeenCalledWith('game-id-123', 'user-id-123', '猫')
    })

    it('should handle incorrect guess', async () => {
      const guessResult = {
        correct: false,
        message: '提示：这是一个1个字的词',
        game: { ...mockGame, attempts: 1, guesses: ['狗'] },
      }
      service.guess.mockResolvedValue(guessResult as any)

      const result = await controller.guess('game-id-123', mockRequest, { guess: '狗' })

      expect(result.correct).toBe(false)
      expect(result.message).toContain('提示')
    })

    it('should pass game id and user id correctly', async () => {
      service.guess.mockResolvedValue({ correct: false, message: '', game: mockGame } as any)

      await controller.guess('game-id-456', mockRequest, { guess: '猫' })

      expect(service.guess).toHaveBeenCalledWith('game-id-456', 'user-id-123', '猫')
    })
  })

  describe('finishGame', () => {
    it('should finish the game with remaining time', async () => {
      const finishedGame = { ...mockGame, status: 'timeout', timeRemaining: 30 }
      service.finishGame.mockResolvedValue(finishedGame as any)

      const result = await controller.finishGame('game-id-123', mockRequest, { timeRemaining: 30 })

      expect(result.status).toBe('timeout')
      expect(service.finishGame).toHaveBeenCalledWith('game-id-123', 'user-id-123', 30)
    })

    it('should pass time remaining correctly', async () => {
      service.finishGame.mockResolvedValue(mockGame as any)

      await controller.finishGame('game-id-123', mockRequest, { timeRemaining: 45 })

      expect(service.finishGame).toHaveBeenCalledWith('game-id-123', 'user-id-123', 45)
    })
  })

  describe('getGame', () => {
    it('should return game by id', async () => {
      service.getGame.mockResolvedValue(mockGame as any)

      const result = await controller.getGame('game-id-123')

      expect(result).toEqual(mockGame)
      expect(service.getGame).toHaveBeenCalledWith('game-id-123')
    })

    it('should return null when game not found', async () => {
      service.getGame.mockResolvedValue(null)

      const result = await controller.getGame('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getUserHistory', () => {
    it('should return user game history with default limit', async () => {
      service.getUserGames.mockResolvedValue([mockGame] as any)

      const result = await controller.getUserHistory(mockRequest)

      expect(result).toEqual([mockGame])
      expect(service.getUserGames).toHaveBeenCalledWith('user-id-123', 10)
    })

    it('should return user game history with custom limit', async () => {
      service.getUserGames.mockResolvedValue([mockGame] as any)

      const result = await controller.getUserHistory(mockRequest, '20')

      expect(service.getUserGames).toHaveBeenCalledWith('user-id-123', 20)
    })

    it('should use default limit when limit is invalid', async () => {
      service.getUserGames.mockResolvedValue([mockGame] as any)

      const result = await controller.getUserHistory(mockRequest, 'invalid')

      expect(service.getUserGames).toHaveBeenCalledWith('user-id-123', 10)
    })
  })

  describe('getLeaderboard', () => {
    it('should return leaderboard with default limit', async () => {
      const leaderboard = [
        { ...mockGame, score: 150, status: 'completed' },
        { ...mockGame, score: 120, status: 'completed' },
      ]
      service.getLeaderboard.mockResolvedValue(leaderboard as any)

      const result = await controller.getLeaderboard()

      expect(result).toEqual(leaderboard)
      expect(service.getLeaderboard).toHaveBeenCalledWith(10)
    })

    it('should return leaderboard with custom limit', async () => {
      service.getLeaderboard.mockResolvedValue([])

      await controller.getLeaderboard('50')

      expect(service.getLeaderboard).toHaveBeenCalledWith(50)
    })

    it('should use default limit when limit is not provided', async () => {
      service.getLeaderboard.mockResolvedValue([])

      await controller.getLeaderboard()

      expect(service.getLeaderboard).toHaveBeenCalledWith(10)
    })
  })
})
