import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Schema, Document, Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'

export interface AchievementCondition {
  type: 'score' | 'count' | 'time' | 'custom'
  value: number
  operator: '>' | '>=' | '=' | '<' | '<='
}

export interface AchievementReward {
  coins?: number
  badge?: string
  title?: string
}

export interface AchievementDefinition {
  id: string
  gameId: string
  name: string
  description: string
  icon: string
  type: 'common' | 'rare' | 'epic' | 'legendary'
  condition: AchievementCondition
  reward?: AchievementReward
  hidden?: boolean
  order?: number
}

export interface UserAchievement {
  userId: string
  gameId: string
  achievementId: string
  unlockedAt: Date
  progress?: number
  data?: Record<string, any>
}

const AchievementSchema = new Schema<AchievementDefinition & Document>(
  {
    id: { type: String, required: true },
    gameId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    type: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
    condition: {
      type: { type: String, enum: ['score', 'count', 'time', 'custom'], required: true },
      value: { type: Number, required: true },
      operator: { type: String, enum: ['>', '>=', '=', '<', '<='], default: '>=' },
    },
    reward: {
      coins: { type: Number },
      badge: { type: String },
      title: { type: String },
    },
    hidden: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const UserAchievementSchema = new Schema<UserAchievement & Document>(
  {
    userId: { type: String, required: true },
    gameId: { type: String, required: true },
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

AchievementSchema.index({ gameId: 1, id: 1 }, { unique: true })
UserAchievementSchema.index({ userId: 1, gameId: 1, achievementId: 1 }, { unique: true })

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name)

  constructor(
    @InjectModel('Achievement') private achievementModel: Model<AchievementDefinition & Document>,
    @InjectModel('UserAchievement') private userAchievementModel: Model<UserAchievement & Document>
  ) {}

  async getGameAchievements(gameId: string): Promise<AchievementDefinition[]> {
    return this.achievementModel.find({ gameId }).sort({ order: 1 }).exec()
  }

  async getUserAchievements(userId: string, gameId?: string): Promise<UserAchievement[]> {
    const query = gameId ? { userId, gameId } : { userId }
    return this.userAchievementModel.find(query).exec()
  }

  async getAchievementDetail(userId: string, achievementId: string): Promise<UserAchievement | null> {
    return this.userAchievementModel.findOne({ userId, achievementId }).exec()
  }

  async checkAndUnlock(
    userId: string,
    gameId: string,
    achievementId: string,
    currentValue: number,
    data?: Record<string, any>
  ): Promise<{ unlocked: boolean; isNew: boolean; achievement?: AchievementDefinition }> {
    const achievement = await this.achievementModel.findOne({ gameId, id: achievementId })
    if (!achievement) {
      return { unlocked: false, isNew: false }
    }

    const condition = achievement.condition
    const meetsCondition = this.evaluateCondition(currentValue, condition)

    if (!meetsCondition) {
      return { unlocked: false, isNew: false }
    }

    const existing = await this.userAchievementModel.findOne({ userId, gameId, achievementId })
    if (existing) {
      if (existing.progress !== currentValue) {
        existing.progress = currentValue
        existing.data = data
        await existing.save()
      }
      return { unlocked: true, isNew: false }
    }

    await this.userAchievementModel.create({
      userId,
      gameId,
      achievementId,
      unlockedAt: new Date(),
      progress: currentValue,
      data,
    })

    this.logger.log(`User ${userId} unlocked achievement ${achievementId} in game ${gameId}`)

    return { unlocked: true, isNew: true, achievement }
  }

  async unlockAchievement(
    userId: string,
    gameId: string,
    achievementId: string,
    data?: Record<string, any>
  ): Promise<{ success: boolean; isNew: boolean; achievement?: AchievementDefinition }> {
    const achievement = await this.achievementModel.findOne({ gameId, id: achievementId })
    if (!achievement) {
      return { success: false, isNew: false }
    }

    const existing = await this.userAchievementModel.findOne({ userId, gameId, achievementId })
    if (existing) {
      return { success: true, isNew: false, achievement }
    }

    await this.userAchievementModel.create({
      userId,
      gameId,
      achievementId,
      unlockedAt: new Date(),
      data,
    })

    this.logger.log(`User ${userId} manually unlocked achievement ${achievementId}`)

    return { success: true, isNew: true, achievement }
  }

  async createAchievement(achievement: AchievementDefinition): Promise<AchievementDefinition> {
    return this.achievementModel.create(achievement)
  }

  async batchCreateAchievements(achievements: AchievementDefinition[]): Promise<AchievementDefinition[]> {
    return this.achievementModel.insertMany(achievements)
  }

  private evaluateCondition(value: number, condition: AchievementCondition): boolean {
    switch (condition.operator) {
      case '>':
        return value > condition.value
      case '>=':
        return value >= condition.value
      case '=':
        return value === condition.value
      case '<':
        return value < condition.value
      case '<=':
        return value <= condition.value
      default:
        return false
    }
  }
}

export const AchievementModels = MongooseModule.forFeature([
  { name: 'Achievement', schema: AchievementSchema },
  { name: 'UserAchievement', schema: UserAchievementSchema },
])