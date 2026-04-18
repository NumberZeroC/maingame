import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface ShareOptions {
  type: 'game' | 'result' | 'achievement' | 'leaderboard'
  gameId?: string
  score?: number
  achievementId?: string
  rank?: number
  message?: string
  platforms?: ('wechat' | 'qq' | 'weibo' | 'copy')[]
}

export interface ShareResult {
  shareUrl: string
  qrCode?: string
  shortCode: string
}

export interface InviteResult {
  inviteUrl: string
  inviteCode: string
  expiresAt?: Date
}

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name)
  private readonly baseUrl: string

  constructor(private configService: ConfigService) {
    this.baseUrl = process.env.PUBLIC_URL || process.env.PUBLIC_IP || 'http://localhost:3000'
  }

  async generateShare(userId: string, options: ShareOptions): Promise<ShareResult> {
    const shortCode = this.generateShortCode()
    const sharePath = this.buildSharePath(options)
    const shareUrl = `${this.baseUrl}${sharePath}?share=${shortCode}&from=${userId}`

    return {
      shareUrl,
      qrCode: `${this.baseUrl}/api/social/qrcode/${shortCode}`,
      shortCode,
    }
  }

  async generateInvite(userId: string, gameId: string, message?: string): Promise<InviteResult> {
    const inviteCode = this.generateInviteCode()
    const inviteUrl = `${this.baseUrl}/game/${gameId}?invite=${inviteCode}&from=${userId}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    return {
      inviteUrl,
      inviteCode,
      expiresAt,
    }
  }

  async shareToWechat(shareUrl: string): Promise<{ success: boolean; message?: string }> {
    return {
      success: true,
      message: '请在微信中打开分享链接',
    }
  }

  async shareToQQ(shareUrl: string): Promise<{ success: boolean; message?: string }> {
    return {
      success: true,
      message: '请在QQ中打开分享链接',
    }
  }

  async shareToWeibo(shareUrl: string, message?: string): Promise<{ success: boolean; message?: string }> {
    const weiboShareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(message || '一起来玩游戏吧！')}`
    return {
      success: true,
      message: weiboShareUrl,
    }
  }

  private buildSharePath(options: ShareOptions): string {
    switch (options.type) {
      case 'game':
        return `/game/${options.gameId}`
      case 'result':
        return `/game/${options.gameId}?score=${options.score}`
      case 'achievement':
        return `/game/${options.gameId}?achievement=${options.achievementId}`
      case 'leaderboard':
        return `/leaderboard?game=${options.gameId}&rank=${options.rank}`
      default:
        return '/'
    }
  }

  private generateShortCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  async generateQRCode(url: string): Promise<string> {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  }
}