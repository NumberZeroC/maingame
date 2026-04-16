import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone)
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  private generateAccessToken(user: any): string {
    const payload = { id: user.id, phone: user.phone }
    return this.jwtService.sign(payload)
  }

  private generateRefreshToken(user: any): string {
    const payload = { id: user.id, phone: user.phone, type: 'refresh' }
    const refreshExpiresIn = this.configService.get<string>('app.jwt.refreshExpiresIn') || '30d'
    return this.jwtService.sign(payload, {
      expiresIn: refreshExpiresIn,
    })
  }

  async login(phone: string, password: string) {
    const user = await this.validateUser(phone, password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      user,
    }
  }

  async register(phone: string, password: string, nickname: string) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await this.usersService.create({
      phone,
      password: hashedPassword,
      nickname,
    })

    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      user,
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken)

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token')
      }

      const user = await this.usersService.findOne(payload.id)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      return {
        accessToken: this.generateAccessToken(user),
        refreshToken: this.generateRefreshToken(user),
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          vipLevel: user.vipLevel,
          coins: user.coins,
        },
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }
}
