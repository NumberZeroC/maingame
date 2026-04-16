import { AiService } from '../src/modules/ai/ai.service'
import { AICoreService } from '../src/modules/ai/ai-core.service'
import { AIConfigService } from '../src/modules/ai/ai-config.service'
import { ConfigService } from '@nestjs/config'

describe('AiService', () => {
  let aiService: AiService
  let coreService: AICoreService
  let configService: AIConfigService

  beforeAll(() => {
    require('dotenv').config({ path: '.env' })
  })

  beforeEach(() => {
    const nestConfigService = new ConfigService()
    configService = new AIConfigService(nestConfigService)
    coreService = new AICoreService(configService)
    aiService = new AiService(coreService)
  })

  describe('generateText', () => {
    it('should generate text from prompt', async () => {
      const prompt = '用一句话描述人工智能'
      const result = await aiService.generateText(prompt, { maxTokens: 50 })

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      console.log('✅ AI 文本生成结果:', result)
    }, 30000)

    it('should handle chat messages', async () => {
      const messages = [{ role: 'user' as const, content: '你好，请介绍一下你自己' }]
      const result = await aiService.chat(messages)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      console.log('✅ AI 聊天结果:', result)
    }, 30000)
  })

  describe('generateImage', () => {
    it('should generate image URL from prompt', async () => {
      const prompt = '一只可爱的熊猫在吃竹子'
      const result = await aiService.generateImage(prompt, {
        size: '1024x1024',
        quality: 'standard',
      })

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^https:\/\//)
      console.log('✅ AI 图像生成 URL:', result)
    }, 60000)
  })

  describe('usageStats', () => {
    it('should get usage statistics', () => {
      const stats = aiService.getUsageStats()
      expect(stats).toBeDefined()
      expect(Array.isArray(stats)).toBe(true)
      console.log('✅ 使用统计:', stats)
    })

    it('should get total cost', () => {
      const cost = aiService.getTotalCost()
      expect(cost).toBeDefined()
      expect(typeof cost).toBe('number')
      console.log('✅ 总成本:', cost)
    })
  })
})
