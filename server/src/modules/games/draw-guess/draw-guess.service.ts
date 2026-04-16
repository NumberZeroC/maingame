import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { DrawGuessGame } from './draw-guess.schema'
import { AiService } from '../../ai/ai.service'

const WORD_CATEGORIES = {
  animals: [
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
    '蝴蝶',
    '狐狸',
    '熊',
  ],
  plants: [
    '向日葵',
    '玫瑰',
    '荷花',
    '梅花',
    '竹子',
    '仙人掌',
    '大树',
    '蘑菇',
    '西瓜',
    '苹果',
    '香蕉',
    '葡萄',
    '草莓',
    '橙子',
    '柠檬',
  ],
  objects: [
    '汽车',
    '飞机',
    '轮船',
    '自行车',
    '房子',
    '城堡',
    '桥梁',
    '手表',
    '眼镜',
    '钢琴',
    '吉他',
    '雨伞',
    '气球',
    '风筝',
    '书本',
  ],
  food: [
    '饺子',
    '面条',
    '汉堡',
    '披萨',
    '蛋糕',
    '冰淇淋',
    '奶茶',
    '寿司',
    '火锅',
    '烤鸭',
    '粽子',
    '汤圆',
    '月饼',
    '糖葫芦',
    '爆米花',
  ],
  nature: [
    '太阳',
    '月亮',
    '星星',
    '彩虹',
    '闪电',
    '雪花',
    '火山',
    '瀑布',
    '沙漠',
    '森林',
    '大海',
    '高山',
    '河流',
    '云朵',
    '流星',
  ],
}

type Category = keyof typeof WORD_CATEGORIES

@Injectable()
export class DrawGuessService {
  constructor(
    @InjectModel(DrawGuessGame.name) private gameModel: Model<DrawGuessGame>,
    private aiService: AiService
  ) {}

  private getRandomWord(category?: Category): { word: string; category: string } {
    let selectedCategory: Category

    if (category && WORD_CATEGORIES[category]) {
      selectedCategory = category
    } else {
      const categories = Object.keys(WORD_CATEGORIES) as Category[]
      selectedCategory = categories[Math.floor(Math.random() * categories.length)]
    }

    const words = WORD_CATEGORIES[selectedCategory]
    const word = words[Math.floor(Math.random() * words.length)]

    return { word, category: selectedCategory }
  }

  async startGame(userId: string, category?: Category): Promise<DrawGuessGame> {
    const { word, category: selectedCategory } = this.getRandomWord(category)

    let imageUrl = `https://picsum.photos/seed/${encodeURIComponent(word)}/400/300`

    try {
      const imagePrompt = `A simple, clear illustration of ${word} in a cartoon style, suitable for a guessing game. The image should be easy to recognize.`
      const imageResult = await this.aiService.generateImage(imagePrompt)
      if (imageResult) {
        imageUrl = imageResult
      }
    } catch (error) {
      console.log('AI image generation failed, using placeholder:', error)
    }

    const game = new this.gameModel({
      word,
      category: selectedCategory,
      imageUrl,
      userId: userId,
      status: 'playing',
      score: 0,
      attempts: 0,
      guesses: [],
      timeLimit: 60,
      timeRemaining: 60,
      startedAt: new Date(),
    })

    return game.save()
  }

  async guess(
    gameId: string,
    userId: string,
    guess: string
  ): Promise<{
    correct: boolean
    message: string
    game: DrawGuessGame
  }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId: userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    game.guesses.push(guess)
    game.attempts += 1

    const normalizedGuess = guess.trim().toLowerCase()
    const normalizedWord = game.word.trim().toLowerCase()

    const correct = normalizedGuess === normalizedWord

    if (correct) {
      game.status = 'completed'
      game.completedAt = new Date()
      game.score = Math.max(10, 100 - (game.attempts - 1) * 10)

      const timeBonus = Math.floor((game.timeRemaining / game.timeLimit) * 50)
      game.score += timeBonus

      await game.save()

      return {
        correct: true,
        message: '恭喜你猜对了！',
        game,
      }
    }

    await game.save()

    const hint = this.getHint(game.word, game.attempts)

    return {
      correct: false,
      message: hint || '再试试看！',
      game,
    }
  }

  private getHint(word: string, attempts: number): string {
    if (attempts === 1) return `提示：这是一个${word.length}个字的词`
    if (attempts === 3) return `提示：第一个字是"${word[0]}"`
    if (attempts >= 5) return `提示：答案是 "${word[0]}${'○'.repeat(word.length - 1)}"`
    return ''
  }

  async finishGame(gameId: string, userId: string, timeRemaining: number): Promise<DrawGuessGame> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId: userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    game.status = 'timeout'
    game.completedAt = new Date()
    game.timeRemaining = timeRemaining

    return game.save()
  }

  async getGame(gameId: string): Promise<DrawGuessGame | null> {
    return this.gameModel.findById(gameId).exec()
  }

  async getUserGames(userId: string, limit: number = 10): Promise<DrawGuessGame[]> {
    return this.gameModel.find({ userId: userId }).sort({ createdAt: -1 }).limit(limit).exec()
  }

  async getLeaderboard(limit: number = 10): Promise<DrawGuessGame[]> {
    return this.gameModel
      .find({ status: 'completed' })
      .sort({ score: -1, completedAt: -1 })
      .limit(limit)
      .exec()
  }
}
