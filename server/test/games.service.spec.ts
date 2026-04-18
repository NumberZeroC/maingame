import { Test, TestingModule } from '@nestjs/testing'
import { GamesService } from '../src/modules/games/games.service'
import { getModelToken } from '@nestjs/mongoose'
import { Game, GameSession, GamePlayRecord, Leaderboard } from '../src/modules/games/game.schema'
import { CacheService } from '../src/common/cache'

describe('GamesService', () => {
  let service: GamesService
  let mockModel: any
  let cacheService: jest.Mocked<CacheService>

  const mockGame = {
    _id: 'game-id',
    id: 'game-id',
    name: 'Test Game',
    description: 'A test game',
    category: ['action'],
    version: '1.0.0',
    thumbnail: 'http://example.com/thumb.jpg',
    status: 'published',
    stats: { playCount: 100, likeCount: 50, rating: 4.5 },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    mockModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }

    const mockSessionModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }

    const mockRecordModel = {
      find: jest.fn().mockReturnThis(),
      create: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }

    const mockLeaderboardModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      create: jest.fn(),
      countDocuments: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: getModelToken(Game.name), useValue: mockModel },
        { provide: getModelToken(GameSession.name), useValue: mockSessionModel },
        { provide: getModelToken(GamePlayRecord.name), useValue: mockRecordModel },
        { provide: getModelToken(Leaderboard.name), useValue: mockLeaderboardModel },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile()

    service = module.get<GamesService>(GamesService)
    cacheService = module.get(CacheService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return an array of games', async () => {
      mockModel.exec.mockResolvedValue([mockGame])

      const result = await service.findAll()

      expect(result).toEqual([mockGame])
      expect(mockModel.find).toHaveBeenCalledWith({})
    })

    it('should filter games by query', async () => {
      mockModel.exec.mockResolvedValue([mockGame])

      const result = await service.findAll({ status: 'published' })

      expect(mockModel.find).toHaveBeenCalledWith({ status: 'published' })
    })
  })

  describe('findOne', () => {
    it('should return a game by id', async () => {
      mockModel.exec.mockResolvedValue(mockGame)

      const result = await service.findOne('game-id')

      expect(result).toEqual(mockGame)
      expect(mockModel.findById).toHaveBeenCalledWith('game-id')
    })

    it('should return null when game not found', async () => {
      mockModel.exec.mockResolvedValue(null)

      const result = await service.findOne('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update and return the game', async () => {
      const updateData = { name: 'Updated Game' }
      mockModel.exec.mockResolvedValue({ ...mockGame, ...updateData })

      const result = await service.update('game-id', updateData)

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('game-id', updateData, { new: true })
      expect(cacheService.del).toHaveBeenCalledWith('leaderboard')
    })

    it('should return null when game not found', async () => {
      mockModel.exec.mockResolvedValue(null)

      const result = await service.update('non-existent', { name: 'Updated' })

      expect(result).toBeNull()
    })
  })

  describe('remove', () => {
    it('should delete the game', async () => {
      await service.remove('game-id')

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('game-id')
      expect(cacheService.del).toHaveBeenCalledWith('leaderboard')
    })
  })

  describe('getLeaderboard', () => {
    it('should return cached leaderboard if available', async () => {
      cacheService.get.mockResolvedValue([{ rank: 1, score: 100 }])

      const result = await service.getLeaderboard('507f1f77bcf86cd799439011')

      expect(result).toEqual([{ rank: 1, score: 100 }])
      expect(cacheService.get).toHaveBeenCalled()
    })

    it('should fetch and cache leaderboard from database', async () => {
      cacheService.get.mockResolvedValue(null)
      mockModel.findOne.mockReturnThis()
      mockModel.exec.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' })

      const mockLeaderboardModel = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GamesService,
          { provide: getModelToken(Game.name), useValue: mockModel },
          { provide: getModelToken(GameSession.name), useValue: {} },
          { provide: getModelToken(GamePlayRecord.name), useValue: {} },
          { provide: getModelToken(Leaderboard.name), useValue: mockLeaderboardModel },
          { provide: CacheService, useValue: cacheService },
        ],
      }).compile()

      const testService = module.get<GamesService>(GamesService)
      const result = await testService.getLeaderboard('507f1f77bcf86cd799439011', 'global', 10)

      expect(result).toBeDefined()
      expect(cacheService.set).toHaveBeenCalled()
    })
  })
})
