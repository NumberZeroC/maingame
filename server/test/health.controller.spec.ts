import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from '../src/modules/health/health.controller'

describe('HealthController', () => {
  let controller: HealthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  describe('check', () => {
    it('should return health status', async () => {
      const result = await controller.check()

      expect(result).toHaveProperty('status', 'ok')
      expect(result).toHaveProperty('timestamp')
      expect(typeof result.timestamp).toBe('string')
    })

    it('should return valid ISO timestamp', async () => {
      const result = await controller.check()

      const timestamp = new Date(result.timestamp)
      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.toString()).not.toBe('Invalid Date')
    })
  })
})
