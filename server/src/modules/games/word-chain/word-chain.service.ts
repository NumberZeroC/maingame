import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { WordChainGame } from './word-chain.schema'
import { AiService } from '../../ai/ai.service'

const START_WORDS = [
  '开心', '美丽', '智慧', '勇敢', '温柔',
  '春天', '阳光', '花朵', '音乐', '故事',
  '梦想', '希望', '友谊', '爱情', '幸福'
]

@Injectable()
export class WordChainService {
  constructor(
    @InjectModel(WordChainGame.name) private gameModel: Model<WordChainGame>,
    private aiService: AiService
  ) {}

  async startGame(userId: string): Promise<WordChainGame> {
    const startWord = START_WORDS[Math.floor(Math.random() * START_WORDS.length)]
    const lastChar = startWord[startWord.length - 1]

    const game = new this.gameModel({
      currentWord: startWord,
      lastChar,
      userId,
      status: 'playing',
      score: 0,
      rounds: 0,
      history: [{ word: startWord, by: 'ai', valid: true }],
      usedWords: [startWord],
      timeLimit: 30,
      startedAt: new Date(),
    })

    return game.save()
  }

  async play(
    gameId: string,
    userId: string,
    word: string
  ): Promise<{ success: boolean; message: string; nextWord: string | null; game: WordChainGame }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    const trimmedWord = word.trim()
    const firstChar = trimmedWord[0]

    if (firstChar !== game.lastChar) {
      game.history.push({ word: trimmedWord, by: 'user', valid: false })
      game.updatedAt = new Date()
      await game.save()
      return {
        success: false,
        message: `"${trimmedWord}" 的第一个字是 "${firstChar}"，应该是 "${game.lastChar}"`,
        nextWord: null,
        game,
      }
    }

    if (game.usedWords.includes(trimmedWord)) {
      game.history.push({ word: trimmedWord, by: 'user', valid: false })
      game.updatedAt = new Date()
      await game.save()
      return {
        success: false,
        message: `"${trimmedWord}" 已经被使用过了`,
        nextWord: null,
        game,
      }
    }

    const isValid = await this.validateWord(trimmedWord)
    if (!isValid) {
      game.history.push({ word: trimmedWord, by: 'user', valid: false })
      game.updatedAt = new Date()
      await game.save()
      return {
        success: false,
        message: `"${trimmedWord}" 不是一个有效的词语`,
        nextWord: null,
        game,
      }
    }

    game.history.push({ word: trimmedWord, by: 'user', valid: true })
    game.usedWords.push(trimmedWord)
    game.rounds += 1
    game.score += 10

    const aiWord = await this.findNextWord(trimmedWord[trimmedWord.length - 1], game.usedWords)
    
    if (!aiWord) {
      game.status = 'completed'
      game.completedAt = new Date()
      game.score += 50
      game.updatedAt = new Date()
      await game.save()
      return {
        success: true,
        message: `太棒了！AI 找不到下一个词了，你赢了！得分 ${game.score}`,
        nextWord: null,
        game,
      }
    }

    game.currentWord = aiWord
    game.lastChar = aiWord[aiWord.length - 1]
    game.history.push({ word: aiWord, by: 'ai', valid: true })
    game.usedWords.push(aiWord)
    game.updatedAt = new Date()
    await game.save()

    return {
      success: true,
      message: `很好！AI 接了 "${aiWord}"，下一个请以 "${game.lastChar}" 开头`,
      nextWord: aiWord,
      game,
    }
  }

  private async validateWord(word: string): Promise<boolean> {
    if (word.length < 2) return false
    
    try {
      const prompt = `"${word}" 是一个有效的中文词语吗？只回答 yes 或 no。`
      const response = await this.aiService.generateText(prompt, { maxTokens: 10 })
      return response.toLowerCase().includes('yes')
    } catch {
      return word.length >= 2 && word.length <= 4
    }
  }

  private async findNextWord(lastChar: string, usedWords: string[]): Promise<string | null> {
    try {
      const prompt = `请给我一个以"${lastChar}"开头的中文词语（2-4个字），不要是以下词语：${usedWords.join(', ')}。只回答词语本身。`
      const response = await this.aiService.generateText(prompt, { maxTokens: 20 })
      const word = response.trim().replace(/[^\u4e00-\u9fa5]/g, '')
      if (word && word[0] === lastChar && !usedWords.includes(word)) {
        return word
      }
    } catch {}

    return null
  }

  async giveUp(gameId: string, userId: string): Promise<WordChainGame> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    game.status = 'failed'
    game.completedAt = new Date()
    game.updatedAt = new Date()

    return game.save()
  }

  async getGame(gameId: string): Promise<WordChainGame | null> {
    return this.gameModel.findById(gameId).exec()
  }

  async getUserGames(userId: string, limit: number = 10): Promise<WordChainGame[]> {
    return this.gameModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec()
  }
}