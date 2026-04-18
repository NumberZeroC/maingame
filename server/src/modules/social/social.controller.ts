import { Controller, Post, Get, Body, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { SocialService, ShareOptions, InviteResult } from './social.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { UseGuards } from '@nestjs/common'
import { IsString, IsOptional, IsEnum, IsNumber, ValidateNested } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class ShareDto {
  @ApiProperty({ enum: ['game', 'result', 'achievement', 'leaderboard'] })
  @IsEnum(['game', 'result', 'achievement', 'leaderboard'])
  type: 'game' | 'result' | 'achievement' | 'leaderboard'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gameId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  score?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  achievementId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rank?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string
}

class InviteDto {
  @ApiProperty()
  @IsString()
  gameId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string
}

@ApiTags('social')
@ApiBearerAuth()
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('share')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate share link' })
  @ApiResponse({ status: 200, description: 'Share link generated' })
  async share(@Body() dto: ShareDto) {
    const userId = 'current-user-id'
    return this.socialService.generateShare(userId, dto)
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate invite link' })
  @ApiResponse({ status: 200, description: 'Invite link generated' })
  async invite(@Body() dto: InviteDto) {
    const userId = 'current-user-id'
    return this.socialService.generateInvite(userId, dto.gameId, dto.message)
  }

  @Get('qrcode/:code')
  @ApiOperation({ summary: 'Get QR code for share link' })
  @ApiParam({ name: 'code', description: 'Share code' })
  async getQRCode(@Param('code') code: string) {
    const url = `${process.env.PUBLIC_URL || 'http://localhost:3000'}?share=${code}`
    return { qrCodeUrl: await this.socialService.generateQRCode(url) }
  }
}