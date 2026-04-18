import { Test, TestingModule } from '@nestjs/testing'
import { SocialService } from '../src/modules/social/social.service'
import { ConfigService } from '@nestjs/config'

describe('SocialService', () => {
  let service: SocialService
  let configService: ConfigService

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<SocialService>(SocialService)
    configService = module.get(ConfigService)
  })

  describe('generateShare', () => {
    it('should generate share link for game', async () => {
      const result = await service.generateShare('user-1', {
        type: 'game',
        gameId: 'game-1',
      })

      expect(result).toHaveProperty('shareUrl')
      expect(result).toHaveProperty('shortCode')
      expect(result.shareUrl).toContain('game-1')
    })

    it('should generate share link for result', async () => {
      const result = await service.generateShare('user-1', {
        type: 'result',
        gameId: 'game-1',
        score: 100,
      })

      expect(result.shareUrl).toContain('score=100')
    })

    it('should generate share link for achievement', async () => {
      const result = await service.generateShare('user-1', {
        type: 'achievement',
        gameId: 'game-1',
        achievementId: 'first_win',
      })

      expect(result.shareUrl).toContain('achievement')
    })
  })

  describe('generateInvite', () => {
    it('should generate invite link', async () => {
      const result = await service.generateInvite('user-1', 'game-1')

      expect(result).toHaveProperty('inviteUrl')
      expect(result).toHaveProperty('inviteCode')
      expect(result.inviteUrl).toContain('game-1')
    })

    it('should generate invite with message', async () => {
      const result = await service.generateInvite('user-1', 'game-1', 'Come play!')

      expect(result).toHaveProperty('inviteUrl')
    })
  })

  describe('generateQRCode', () => {
    it('should generate QR code URL', async () => {
      const result = await service.generateQRCode('http://example.com')

      expect(result).toContain('qrserver.com')
    })
  })
})