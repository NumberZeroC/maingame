import { Test, TestingModule } from '@nestjs/testing'
import { AchievementService } from '../src/modules/achievements/achievement.service'
import { getModelToken } from '@nestjs/mongoose'

describe('AchievementService', () => {
  let service: AchievementService
  let achievementModel: any
  let userAchievementModel: any

  const mockAchievement = {
    id: 'first_win',
    gameId: 'game-1',
    name: 'First Win',
    description: 'Win your first game',
    icon: '🏆',
    type: 'common',
    condition: { type: 'count', value: 1, operator: '>=' },
  }

  beforeEach(async () => {
    achievementModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      create: jest.fn(),
      insertMany: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }

    userAchievementModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      create: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementService,
        { provide: getModelToken('Achievement'), useValue: achievementModel },
        { provide: getModelToken('UserAchievement'), useValue: userAchievementModel },
      ],
    }).compile()

    service = module.get<AchievementService>(AchievementService)
  })

  describe('getGameAchievements', () => {
    it('should return achievements for a game', async () => {
      achievementModel.exec.mockResolvedValue([mockAchievement])

      const result = await service.getGameAchievements('game-1')

      expect(result).toEqual([mockAchievement])
      expect(achievementModel.find).toHaveBeenCalledWith({ gameId: 'game-1' })
    })

    it('should return empty array when no achievements', async () => {
      achievementModel.exec.mockResolvedValue([])

      const result = await service.getGameAchievements('game-1')

      expect(result).toEqual([])
    })
  })

  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      const mockUserAchievement = {
        userId: 'user-1',
        gameId: 'game-1',
        achievementId: 'first_win',
        unlockedAt: new Date(),
      }
      userAchievementModel.exec.mockResolvedValue([mockUserAchievement])

      const result = await service.getUserAchievements('user-1', 'game-1')

      expect(result).toHaveLength(1)
    })
  })

  describe('unlockAchievement', () => {
    it('should unlock achievement when not already unlocked', async () => {
      achievementModel.exec.mockResolvedValue(mockAchievement)
      userAchievementModel.exec.mockResolvedValue(null)
      userAchievementModel.create.mockResolvedValue({})

      const result = await service.unlockAchievement('user-1', 'game-1', 'first_win')

      expect(result.success).toBe(true)
      expect(result.isNew).toBe(true)
    })

    it('should return existing achievement when already unlocked', async () => {
      achievementModel.exec.mockResolvedValue(mockAchievement)
      userAchievementModel.exec.mockResolvedValue({
        userId: 'user-1',
        achievementId: 'first_win',
        save: jest.fn(),
      })

      const result = await service.unlockAchievement('user-1', 'game-1', 'first_win')

      expect(result.success).toBe(true)
      expect(result.isNew).toBe(false)
    })

    it('should return false when achievement not found', async () => {
      achievementModel.exec.mockResolvedValue(null)

      const result = await service.unlockAchievement('user-1', 'game-1', 'non-existent')

      expect(result.success).toBe(false)
    })
  })

  describe('checkAndUnlock', () => {
    it('should unlock when condition is met', async () => {
      achievementModel.exec.mockResolvedValue(mockAchievement)
      userAchievementModel.exec.mockResolvedValue(null)
      userAchievementModel.create.mockResolvedValue({})

      const result = await service.checkAndUnlock('user-1', 'game-1', 'first_win', 5)

      expect(result.unlocked).toBe(true)
    })

    it('should not unlock when condition not met', async () => {
      achievementModel.exec.mockResolvedValue(mockAchievement)

      const result = await service.checkAndUnlock('user-1', 'game-1', 'first_win', 0)

      expect(result.unlocked).toBe(false)
    })
  })
})