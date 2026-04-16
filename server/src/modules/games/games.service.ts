import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Game, GameSession, GamePlayRecord, Leaderboard } from './game.schema'
import { CacheService } from '../../common/cache'

const LEADERBOARD_CACHE_TTL = 60
const LEADERBOARD_CACHE_KEY = 'leaderboard'

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(GameSession.name) private sessionModel: Model<GameSession>,
    @InjectModel(GamePlayRecord.name) private recordModel: Model<GamePlayRecord>,
    @InjectModel(Leaderboard.name) private leaderboardModel: Model<Leaderboard>,
    private cacheService: CacheService
  ) {}

  async findAll(query: any = {}): Promise<Game[]> {
    return this.gameModel.find(query).exec()
  }

  async findOne(id: string): Promise<Game | null> {
    return this.gameModel.findById(id).exec()
  }

  async findBySlug(slug: string): Promise<Game | null> {
    return this.gameModel.findOne({ slug }).exec()
  }

  async getManifest(id: string): Promise<any> {
    const game = await this.gameModel.findById(id).exec()
    if (!game) return null
    return (
      game.manifest || {
        id: game.id,
        slug: game.slug,
        name: game.name,
        version: game.version,
        entry: game.entry,
        thumbnail: game.thumbnail,
        banner: game.banner,
        description: game.description,
        category: game.category,
        aiRequirements: game.aiRequirements,
      }
    )
  }

  async create(gameData: Partial<Game>): Promise<Game> {
    const game = new this.gameModel(gameData)
    const saved = await game.save()
    await this.cacheService.del(LEADERBOARD_CACHE_KEY)
    return saved
  }

  async update(id: string, gameData: Partial<Game>): Promise<Game | null> {
    const result = await this.gameModel.findByIdAndUpdate(id, gameData, { new: true }).exec()
    await this.cacheService.del(LEADERBOARD_CACHE_KEY)
    return result
  }

  async remove(id: string): Promise<void> {
    await this.gameModel.findByIdAndDelete(id).exec()
    await this.cacheService.del(LEADERBOARD_CACHE_KEY)
  }

  async getPopularGames(limit: number = 10): Promise<Game[]> {
    const cacheKey = `popular_games:${limit}`
    const cached = await this.cacheService.get<Game[]>(cacheKey)
    if (cached) return cached

    const games = await this.gameModel
      .find({ status: 'published' })
      .sort({ 'stats.playCount': -1, 'stats.rating': -1 })
      .limit(limit)
      .exec()

    await this.cacheService.set(cacheKey, games, LEADERBOARD_CACHE_TTL)
    return games
  }

  async getGameSession(userId: string, gameId: string): Promise<GameSession | null> {
    return this.sessionModel
      .findOne({ userId: new Types.ObjectId(userId), gameId: new Types.ObjectId(gameId) })
      .exec()
  }

  async saveGameSession(userId: string, gameId: string, key: string, value: any): Promise<void> {
    const session = await this.sessionModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), gameId: new Types.ObjectId(gameId) },
        { $set: { [`saveData.${key}`]: value, lastPlayedAt: new Date() } },
        { upsert: true, new: true }
      )
      .exec()
  }

  async loadGameSession(userId: string, gameId: string, key?: string): Promise<any> {
    const session = await this.getGameSession(userId, gameId)
    if (!session) return null
    if (key) return session.saveData[key] ?? null
    return session.saveData
  }

  async clearGameSession(userId: string, gameId: string): Promise<void> {
    await this.sessionModel
      .updateOne(
        { userId: new Types.ObjectId(userId), gameId: new Types.ObjectId(gameId) },
        { $set: { saveData: {} } }
      )
      .exec()
  }

  async finishGameSession(
    userId: string,
    gameId: string,
    result: { score?: number; duration?: number; data?: any; achievements?: string[] }
  ): Promise<void> {
    const { score = 0, duration = 0, data, achievements = [] } = result

    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    await this.recordModel.create({
      userId: new Types.ObjectId(userId),
      gameId: new Types.ObjectId(gameId),
      sessionId,
      score,
      duration,
      data,
      achievements,
      startedAt: new Date(Date.now() - duration * 1000),
      finishedAt: new Date(),
    })

    await this.sessionModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), gameId: new Types.ObjectId(gameId) },
        {
          $set: { lastPlayedAt: new Date() },
          $inc: { totalPlayTime: duration },
          $max: { highScore: score },
          $addToSet: { achievements: { $each: achievements } },
        },
        { upsert: true, new: true }
      )
      .exec()

    await this.gameModel
      .findByIdAndUpdate(gameId, {
        $inc: { 'stats.playCount': 1, 'stats.avgDuration': duration },
      })
      .exec()

    await this.cacheService.del(LEADERBOARD_CACHE_KEY)
  }

  async getGamePlayRecords(
    userId: string,
    gameId: string,
    limit: number = 10
  ): Promise<GamePlayRecord[]> {
    return this.recordModel
      .find({ userId: new Types.ObjectId(userId), gameId: new Types.ObjectId(gameId) })
      .sort({ finishedAt: -1 })
      .limit(limit)
      .exec()
  }

  async getUserStats(userId: string): Promise<any> {
    const sessions = await this.sessionModel.find({ userId: new Types.ObjectId(userId) }).exec()
    return {
      totalGames: sessions.length,
      totalPlayTime: sessions.reduce((sum, s) => sum + s.totalPlayTime, 0),
      achievements: sessions.flatMap((s) => s.achievements),
    }
  }

  async submitScore(
    userId: string,
    gameId: string,
    score: number,
    extraData?: Record<string, any>
  ): Promise<Leaderboard> {
    await this.cacheService.del(`${LEADERBOARD_CACHE_KEY}:${gameId}`)

    const existing = await this.leaderboardModel
      .findOne({ userId: new Types.ObjectId(userId), gameId: new Types.ObjectId(gameId) })
      .exec()

    if (existing) {
      if (score > existing.score) {
        existing.score = score
        existing.extraData = extraData || existing.extraData
        existing.playedAt = new Date()
        return existing.save()
      }
      return existing
    }

    const entry = new this.leaderboardModel({
      userId: new Types.ObjectId(userId),
      gameId: new Types.ObjectId(gameId),
      score,
      extraData,
      playedAt: new Date(),
    })
    return entry.save()
  }

  async getLeaderboard(
    gameId: string,
    type: string = 'global',
    limit: number = 100
  ): Promise<any[]> {
    const cacheKey = `${LEADERBOARD_CACHE_KEY}:${gameId}:${type}:${limit}`
    const cached = await this.cacheService.get<any[]>(cacheKey)
    if (cached) return cached

    const entries = await this.leaderboardModel
      .find({ gameId: new Types.ObjectId(gameId) })
      .sort({ score: -1 })
      .limit(limit)
      .populate('userId', 'nickname avatar')
      .exec()

    const result = entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId._id,
      nickname: (entry.userId as any).nickname || 'Unknown',
      avatar: (entry.userId as any).avatar,
      score: entry.score,
      extraData: entry.extraData,
      playedAt: entry.playedAt,
    }))

    await this.cacheService.set(cacheKey, result, LEADERBOARD_CACHE_TTL)
    return result
  }

  async getUserRank(userId: string, gameId: string): Promise<{ rank: number; score: number }> {
    const userEntry = await this.leaderboardModel
      .findOne({ userId: new Types.ObjectId(userId), gameId: new Types.ObjectId(gameId) })
      .exec()

    if (!userEntry) {
      return { rank: -1, score: 0 }
    }

    const higherCount = await this.leaderboardModel
      .countDocuments({
        gameId: new Types.ObjectId(gameId),
        score: { $gt: userEntry.score },
      })
      .exec()

    return { rank: higherCount + 1, score: userEntry.score }
  }
}
