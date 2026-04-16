import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Game } from './game.schema'
import { CacheService } from '../../common/cache'

const LEADERBOARD_CACHE_TTL = 60 // 1 minute
const LEADERBOARD_CACHE_KEY = 'leaderboard'

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    private cacheService: CacheService
  ) {}

  async findAll(query: any = {}): Promise<Game[]> {
    return this.gameModel.find(query).exec()
  }

  async findOne(id: string): Promise<Game | null> {
    return this.gameModel.findById(id).exec()
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

  async getLeaderboard(limit: number = 10): Promise<Game[]> {
    const cacheKey = `${LEADERBOARD_CACHE_KEY}:${limit}`
    const cached = await this.cacheService.get<Game[]>(cacheKey)
    if (cached) return cached

    const leaderboard = await this.gameModel
      .find({ status: 'published' })
      .sort({ 'stats.playCount': -1, 'stats.rating': -1 })
      .limit(limit)
      .exec()

    await this.cacheService.set(cacheKey, leaderboard, LEADERBOARD_CACHE_TTL)
    return leaderboard
  }
}
