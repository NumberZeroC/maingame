import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NumberGuessGame } from './number-guess.schema'

@Injectable()
export class NumberGuessService {
  constructor(
    @InjectModel(NumberGuessGame.name) private gameModel: Model<NumberGuessGame>
  ) {}

  async startGame(userId: string, minRange: number = 1, maxRange: number = 100): Promise<NumberGuessGame> {
    const targetNumber = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange

    const game = new this.gameModel({
      targetNumber,
      minRange,
      maxRange,
      userId,
      status: 'playing',
      score: 0,
      attempts: 0,
      guesses: [],
      timeLimit: 60,
      startedAt: new Date(),
    })

    return game.save()
  }

  async guess(
    gameId: string,
    userId: string,
    guess: number
  ): Promise<{ correct: boolean; result: 'higher' | 'lower' | 'correct'; message: string; game: NumberGuessGame }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    if (guess < game.minRange || guess > game.maxRange) {
      throw new Error(`Guess must be between ${game.minRange} and ${game.maxRange}`)
    }

    game.attempts += 1
    game.updatedAt = new Date()

    let result: 'higher' | 'lower' | 'correct'
    let message: string
    let correct = false

    if (guess === game.targetNumber) {
      result = 'correct'
      correct = true
      game.status = 'completed'
      game.completedAt = new Date()
      game.score = this.calculateScore(game.attempts, game.minRange, game.maxRange)
      message = `恭喜你猜对了！答案是 ${game.targetNumber}，你用了 ${game.attempts} 次，得分 ${game.score}`
    } else if (guess < game.targetNumber) {
      result = 'higher'
      message = `${guess} 太小了！再试试更大的数字`
    } else {
      result = 'lower'
      message = `${guess} 太大了！再试试更小的数字`
    }

    game.guesses.push({ value: guess, result })
    await game.save()

    return { correct, result, message, game }
  }

  private calculateScore(attempts: number, minRange: number, maxRange: number): number {
    const range = maxRange - minRange + 1
    const maxAttempts = Math.ceil(Math.log2(range))
    const efficiency = maxAttempts / attempts
    return Math.round(Math.min(100, efficiency * 100))
  }

  async giveUp(gameId: string, userId: string): Promise<NumberGuessGame> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    game.status = 'timeout'
    game.completedAt = new Date()
    game.updatedAt = new Date()

    return game.save()
  }

  async getGame(gameId: string): Promise<NumberGuessGame | null> {
    return this.gameModel.findById(gameId).exec()
  }

  async getUserGames(userId: string, limit: number = 10): Promise<NumberGuessGame[]> {
    return this.gameModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec()
  }
}