import { Test, TestingModule } from '@nestjs/testing'
import { GamesService } from '../src/modules/games/games.service'
import { getModelToken } from '@nestjs/mongoose'
import { Game } from '../src/modules/games/game.schema'
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

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: getModelToken(Game.name), useValue: mockModel },
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
      cacheService.get.mockResolvedValue([mockGame])

      const result = await service.getLeaderboard(10)

      expect(result).toEqual([mockGame])
      expect(cacheService.get).toHaveBeenCalledWith('leaderboard:10')
      expect(mockModel.find).not.toHaveBeenCalled()
    })

    it('should fetch and cache leaderboard from database', async () => {
      cacheService.get.mockResolvedValue(null)
      mockModel.exec.mockResolvedValue([mockGame])

      const result = await service.getLeaderboard(10)

      expect(result).toEqual([mockGame])
      expect(mockModel.find).toHaveBeenCalledWith({ status: 'published' })
      expect(cacheService.set).toHaveBeenCalledWith('leaderboard:10', [mockGame], 60)
    })
  })
})
