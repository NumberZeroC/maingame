import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DetectiveGame, Suspect, Clue } from './detective-game.schema'
import { AiService } from '../../ai/ai.service'

const CASE_TEMPLATES = [
  {
    theme: '豪宅谋杀',
    setting: '富豪在自家豪宅中被发现死亡',
    locations: ['书房', '客厅', '花园', '厨房'],
  },
  {
    theme: '博物馆盗窃',
    setting: '珍贵文物在博物馆夜间失踪',
    locations: ['展厅', '保安室', '仓库', '办公室'],
  },
  {
    theme: '公司密案',
    setting: '公司CEO在会议室被发现昏迷',
    locations: ['会议室', 'CEO办公室', '员工休息室', '档案室'],
  },
]

const SUSPECT_NAMES = ['张伟', '李娜', '王强', '陈静', '刘洋', '赵敏', '孙磊', '周婷']
const OCCUPATIONS = ['管家', '厨师', '保安', '秘书', '助理', '司机', '律师', '医生']
const PERSONALITIES = ['沉稳', '急躁', '神秘', '友善', '冷漠', '热情', '谨慎', '傲慢']

@Injectable()
export class DetectiveGameService {
  constructor(
    @InjectModel(DetectiveGame.name) private gameModel: Model<DetectiveGame>,
    private aiService: AiService
  ) {}

  async startGame(userId: string): Promise<DetectiveGame> {
    const template = CASE_TEMPLATES[Math.floor(Math.random() * CASE_TEMPLATES.length)]
    const caseData = await this.generateCase(template)

    const game = new this.gameModel({
      title: `${template.theme}案`,
      scenario: caseData.scenario,
      victimName: caseData.victimName,
      location: template.locations[0],
      suspects: caseData.suspects,
      clues: caseData.clues,
      culpritId: caseData.culpritId,
      solution: caseData.solution,
      userId,
      status: 'playing',
      investigationPoints: 100,
      conversations: [],
      discoveredClues: [],
      deductions: [],
      maxQuestionsPerSuspect: 3,
      startedAt: new Date(),
    })

    return game.save()
  }

  private async generateCase(template: { theme: string; setting: string; locations: string[] }): Promise<{
    scenario: string
    victimName: string
    suspects: Suspect[]
    clues: Clue[]
    culpritId: string
    solution: string
  }> {
    const victimName = SUSPECT_NAMES[Math.floor(Math.random() * SUSPECT_NAMES.length)]
    const culpritIndex = Math.floor(Math.random() * 4)
    const suspectCount = 4

    const suspects: Suspect[] = []
    const usedNames = new Set<string>([victimName])

    for (let i = 0; i < suspectCount; i++) {
      let name: string
      do {
        name = SUSPECT_NAMES[Math.floor(Math.random() * SUSPECT_NAMES.length)]
      } while (usedNames.has(name))
      usedNames.add(name)

      const isCulprit = i === culpritIndex

      suspects.push({
        id: `suspect-${i}`,
        name,
        occupation: OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)],
        relationship: this.getRandomRelationship(),
        personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
        testimony: [],
        isCulprit,
        alibi: isCulprit ? '声称在独自休息' : this.getRandomValidAlibi(),
        secrets: isCulprit ? ['有作案动机', '时间上有疑点'] : [],
        questioned: false,
      })
    }

    const clues: Clue[] = [
      {
        id: 'clue-1',
        name: '现场指纹',
        description: '在关键位置发现的指纹',
        location: template.locations[0],
        importance: 'major',
        discovered: false,
        hints: ['需要比对嫌疑人指纹'],
      },
      {
        id: 'clue-2',
        name: '监控记录',
        description: '监控录像片段',
        location: template.locations[1],
        importance: 'critical',
        discovered: false,
        hints: ['可能显示可疑人员'],
      },
      {
        id: 'clue-3',
        name: '匿名信件',
        description: '收到的一封警告信',
        location: template.locations[2],
        importance: 'minor',
        discovered: false,
        hints: ['可能是威胁信'],
      },
      {
        id: 'clue-4',
        name: '财务记录',
        description: '最近的财务往来记录',
        location: template.locations[3],
        importance: 'major',
        discovered: false,
        hints: ['可能有异常转账'],
      },
    ]

    const culprit = suspects[culpritIndex]
    const solution = `凶手是${culprit.name}。动机：${culprit.relationship === '商业伙伴' ? '利益纠纷' : '私人恩怨'}。关键证据：监控录像显示其在案发时间在现场附近。`

    const scenario = `${template.setting}。死者：${victimName}。警方已锁定4名嫌疑人，请你作为侦探展开调查。`

    return { scenario, victimName, suspects, clues, culpritId: culprit.id, solution }
  }

  private getRandomRelationship(): string {
    const relationships = ['亲属', '商业伙伴', '朋友', '员工', '竞争对手', '邻居']
    return relationships[Math.floor(Math.random() * relationships.length)]
  }

  private getRandomValidAlibi(): string {
    const alibis = ['与其他人在会议室开会', '在花园散步被多人看到', '在厨房准备晚餐', '外出办事有监控证明']
    return alibis[Math.floor(Math.random() * alibis.length)]
  }

  async questionSuspect(
    gameId: string,
    userId: string,
    suspectId: string,
    question: string
  ): Promise<{ response: string; game: DetectiveGame; questionsRemaining: number }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    const suspect = game.suspects.find((s) => s.id === suspectId)
    if (!suspect) {
      throw new Error('Suspect not found')
    }

    const existingConversation = game.conversations.find((c) => c.suspectId === suspectId)
    const questionsAsked = existingConversation?.messages.filter((m) => m.role === 'user').length || 0

    if (questionsAsked >= game.maxQuestionsPerSuspect) {
      throw new Error(`已经问完该嫌疑人的所有问题（最多${game.maxQuestionsPerSuspect}次）`)
    }

    if (game.investigationPoints <= 0) {
      game.status = 'failed'
      game.completedAt = new Date()
      await game.save()
      throw new Error('调查点数耗尽')
    }

    game.investigationPoints -= 10

    const aiResponse = await this.generateSuspectResponse(suspect, question, game)

    if (!existingConversation) {
      game.conversations.push({
        suspectId,
        messages: [
          { role: 'user', content: question, timestamp: new Date() },
          { role: 'ai', content: aiResponse, timestamp: new Date() },
        ],
      })
    } else {
      existingConversation.messages.push(
        { role: 'user', content: question, timestamp: new Date() },
        { role: 'ai', content: aiResponse, timestamp: new Date() }
      )
    }

    suspect.questioned = true
    game.updatedAt = new Date()
    await game.save()

    const newQuestionsRemaining = game.maxQuestionsPerSuspect - questionsAsked - 1

    return {
      response: aiResponse,
      game,
      questionsRemaining: newQuestionsRemaining,
    }
  }

  private async generateSuspectResponse(suspect: Suspect, question: string, game: DetectiveGame): Promise<string> {
    const prompt = `你正在扮演一个侦探游戏中的嫌疑人角色。

嫌疑人信息：
- 姓名：${suspect.name}
- 职业：${suspect.occupation}
- 性格：${suspect.personality}
- 与死者关系：${suspect.relationship}
- 证词/不在场证明：${suspect.alibi}
- 是否是凶手：${suspect.isCulprit ? '是的' : '不是'}

案件：${game.scenario}

侦探问你："${question}"

请以嫌疑人的身份回答，保持${suspect.personality}的性格特点。
${suspect.isCulprit ? '你是凶手，要隐藏真相，但回答中可以有细微的犹豫或矛盾。' : '你是无辜的，诚实地回答问题。'}

回答要简短（2-3句话），符合角色性格。`

    try {
      return await this.aiService.generateText(prompt, { maxTokens: 100 })
    } catch {
      if (suspect.isCulprit) {
        return `${suspect.personality === '冷漠' ? '冷漠地看着你：' : '犹豫了一下：'}"${suspect.alibi}"。`
      }
      return `${suspect.personality === '友善' ? '认真地回答：' : '平静地说：'}"${suspect.alibi}"。我当时确实在那里。`
    }
  }

  async investigateClue(
    gameId: string,
    userId: string,
    clueId: string
  ): Promise<{ discovery: string; game: DetectiveGame }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    const clue = game.clues.find((c) => c.id === clueId)
    if (!clue) {
      throw new Error('Clue not found')
    }

    if (clue.discovered) {
      throw new Error('该线索已被调查')
    }

    if (game.investigationPoints <= 0) {
      game.status = 'failed'
      game.completedAt = new Date()
      await game.save()
      throw new Error('调查点数耗尽')
    }

    const cost = clue.importance === 'critical' ? 20 : clue.importance === 'major' ? 15 : 10
    game.investigationPoints -= cost

    const discovery = await this.generateClueDiscovery(clue, game)

    clue.discovered = true
    game.discoveredClues.push(clueId)
    game.updatedAt = new Date()
    await game.save()

    return { discovery, game }
  }

  private async generateClueDiscovery(clue: Clue, game: DetectiveGame): Promise<string> {
    const culprit = game.suspects.find((s) => s.isCulprit)

    let discoveryText = `在${clue.location}发现了「${clue.name}」：${clue.description}。`

    if (clue.importance === 'critical') {
      discoveryText += `这是一个关键证据！${clue.hints[0]}。`
      if (culprit) {
        discoveryText += `分析显示可能与${culprit.name}有关。`
      }
    } else if (clue.importance === 'major') {
      discoveryText += `这是一个重要线索。${clue.hints[0]}。`
    } else {
      discoveryText += `这可能提供一些背景信息。`
    }

    return discoveryText
  }

  async makeDeduction(
    gameId: string,
    userId: string,
    statement: string
  ): Promise<{ feedback: string; correct: boolean; game: DetectiveGame }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    const culprit = game.suspects.find((s) => s.isCulprit)

    let correct = false
    let feedback = ''

    if (statement.includes(culprit?.name || '') && (statement.includes('凶手') || statement.includes('嫌疑人'))) {
      correct = true
      feedback = '你的推理方向正确，继续深入调查。'
    } else if (statement.includes('动机') || statement.includes('时间') || statement.includes('证据')) {
      feedback = '有价值的推理角度，但需要更多证据支持。'
    } else {
      feedback = '这个推理可能需要重新考虑。'
    }

    game.deductions.push({
      statement,
      timestamp: new Date(),
      correct,
    })
    game.updatedAt = new Date()
    await game.save()

    return { feedback, correct, game }
  }

  async accuse(
    gameId: string,
    userId: string,
    suspectId: string,
    reasoning: string
  ): Promise<{ correct: boolean; message: string; game: DetectiveGame }> {
    const game = await this.gameModel.findOne({
      _id: gameId,
      userId,
      status: 'playing',
    })

    if (!game) {
      throw new Error('Game not found or already completed')
    }

    const accusedSuspect = game.suspects.find((s) => s.id === suspectId)
    if (!accusedSuspect) {
      throw new Error('Suspect not found')
    }

    const isCorrect = accusedSuspect.isCulprit
    game.status = isCorrect ? 'solved' : 'failed'
    game.completedAt = new Date()

    game.finalAccusation = {
      suspectId,
      reasoning,
      timestamp: new Date(),
      correct: isCorrect,
    }

    game.score = this.calculateScore(game, isCorrect)
    game.updatedAt = new Date()
    await game.save()

    const message = isCorrect
      ? `🎉 案件破解！凶手确实是${accusedSuspect.name}。\n\n真相：${game.solution}\n\n得分：${game.score}`
      : `❌ 判断失误！${accusedSuspect.name}并不是凶手。\n\n真相：${game.solution}\n\n得分：${game.score}`

    return { correct: isCorrect, message, game }
  }

  private calculateScore(game: DetectiveGame, solved: boolean): number {
    let score = 0

    if (solved) {
      score += 50
      score += Math.floor(game.investigationPoints / 2)
      score += game.discoveredClues.length * 5

      const questionedCount = game.suspects.filter((s) => s.questioned).length
      score += questionedCount * 10

      const correctDeductions = game.deductions.filter((d) => d.correct).length
      score += correctDeductions * 15
    } else {
      score = game.discoveredClues.length * 2
    }

    return Math.min(100, score)
  }

  async getGame(gameId: string): Promise<DetectiveGame | null> {
    return this.gameModel.findById(gameId).exec()
  }

  async getUserGames(userId: string, limit: number = 10): Promise<DetectiveGame[]> {
    return this.gameModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec()
  }

  async giveUp(gameId: string, userId: string): Promise<DetectiveGame> {
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
}