import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { TwentyQuestionsGame } from './twenty-questions.schema'
import { AiService } from '../../ai/ai.service'

const ITEMS_BY_CATEGORY: Record<string, string[]> = {
  '动物': ['猫', '狗', '老虎', '熊猫', '大象', '长颈鹿', '企鹅', '蝴蝶', '海豚', '兔子'],
  '植物': ['向日葵', '玫瑰', '竹子', '仙人掌', '大树', '荷花', '梅花', '蘑菇', '西瓜', '苹果'],
  '物品': ['汽车', '飞机', '手表', '雨伞', '书本', '手机', '眼镜', '钢琴', '吉他', '气球'],
  '食物': ['饺子', '面条', '汉堡', '披萨', '蛋糕', '冰淇淋', '奶茶', '寿司', '火锅', '烤鸭'],
  '人物': ['老师', '医生', '警察', '厨师', '画家', '运动员', '歌手', '科学家', '宇航员', '消防员'],
  '地点': ['学校', '医院', '公园', '超市', '图书馆', '博物馆', '火车站', '机场', '海滩', '山顶'],
  '抽象概念': ['爱情', '友谊', '梦想', '时间', '幸福', '自由', '勇气', '智慧', '希望', '和平'],
}

@Injectable()
export class TwentyQuestionsService {
  constructor(
    @InjectModel(TwentyQuestionsGame.name) private gameModel: Model<TwentyQuestionsGame>,
    private aiService: AiService
  ) {}

  async startGame(userId: string, category?: string): Promise<TwentyQuestionsGame> {
    let selectedCategory: string
    let items: string[]

    if (category && ITEMS_BY_CATEGORY[category]) {
      selectedCategory = category
      items = ITEMS_BY_CATEGORY[category]
    } else {
      const categories = Object.keys(ITEMS_BY_CATEGORY)
      selectedCategory = categories[Math.floor(Math.random() * categories.length)]
      items = ITEMS_BY_CATEGORY[selectedCategory]
    }

    const answer = items[Math.floor(Math.random() * items.length)]

    const game = new this.gameModel({
      answer,
      category: selectedCategory,
      userId,
      status: 'playing',
      score: 0,
      questions: [],
      guesses: [],
      questionsRemaining: 20,
      startedAt: new Date(),
    })

    return game.save()
  }

  async ask(
    gameId: string,
    userId: string,
    question: string
  ): Promise<{ answer: 'yes' | 'no' | 'unknown'; message: string; game: TwentyQuestionsGame }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    if (game.questionsRemaining <= 0) {
      game.status = 'failed'
      game.completedAt = new Date()
      await game.save()
      throw new Error('No questions remaining')
    }

    game.questionsRemaining -= 1
    game.updatedAt = new Date()

    const aiAnswer = await this.getAiAnswer(game.answer, question)
    game.questions.push({ question, answer: aiAnswer })
    await game.save()

    const answerText = aiAnswer === 'yes' ? '是' : aiAnswer === 'no' ? '不是' : '不确定'

    return {
      answer: aiAnswer,
      message: `问："${question}" → 答：${answerText}`,
      game,
    }
  }

  async guess(
    gameId: string,
    userId: string,
    guess: string
  ): Promise<{ correct: boolean; message: string; game: TwentyQuestionsGame }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    const isCorrect = guess.trim().toLowerCase() === game.answer.toLowerCase()
    game.guesses.push({ guess: guess.trim(), correct: isCorrect })
    game.updatedAt = new Date()

    if (isCorrect) {
      game.status = 'completed'
      game.completedAt = new Date()
      game.score = this.calculateScore(game.questions.length, game.questionsRemaining)
      await game.save()
      return {
        correct: true,
        message: `恭喜你猜对了！答案是 "${game.answer}"，得分 ${game.score}`,
        game,
      }
    }

    await game.save()
    return {
      correct: false,
      message: `"${guess}" 不是正确答案，继续猜吧！`,
      game,
    }
  }

  private async getAiAnswer(answer: string, question: string): Promise<'yes' | 'no' | 'unknown'> {
    try {
      const prompt = `我正在想的是"${answer}"。用户问："${question}"。请只回答 yes、no 或 unknown（如果问题无法用是/否回答）。不要解释。`
      const response = await this.aiService.generateText(prompt, { maxTokens: 10 })
      const lowerResponse = response.toLowerCase()
      
      if (lowerResponse.includes('yes')) return 'yes'
      if (lowerResponse.includes('no')) return 'no'
      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  private calculateScore(questionsAsked: number, questionsRemaining: number): number {
    const efficiency = questionsRemaining / 20
    return Math.round(50 + efficiency * 100)
  }

  async giveUp(gameId: string, userId: string): Promise<TwentyQuestionsGame> {
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

  async getGame(gameId: string): Promise<TwentyQuestionsGame | null> {
    return this.gameModel.findById(gameId).exec()
  }

  async getUserGames(userId: string, limit: number = 10): Promise<TwentyQuestionsGame[]> {
    return this.gameModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec()
  }
}