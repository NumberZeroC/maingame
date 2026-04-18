import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { AchievementService, AchievementDefinition, UserAchievement } from './achievement.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { UseGuards } from '@nestjs/common'

@ApiTags('achievements')
@ApiBearerAuth()
@Controller()
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get('games/:id/achievements')
  @ApiOperation({ summary: 'Get game achievements list' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Achievements list' })
  async getGameAchievements(@Param('id') gameId: string) {
    return this.achievementService.getGameAchievements(gameId)
  }

  @Get('users/me/achievements')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user unlocked achievements' })
  @ApiResponse({ status: 200, description: 'User achievements' })
  async getUserAchievements() {
    const userId = 'current-user-id'
    return this.achievementService.getUserAchievements(userId)
  }

  @Post('games/:id/achievements/unlock')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unlock achievement' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Achievement unlocked' })
  async unlockAchievement(
    @Param('id') gameId: string,
    @Body() body: { achievementId: string; data?: Record<string, any> }
  ) {
    const userId = 'current-user-id'
    return this.achievementService.unlockAchievement(
      userId,
      gameId,
      body.achievementId,
      body.data
    )
  }

  @Post('games/:id/achievements/check')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check and unlock achievement based on condition' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Achievement check result' })
  async checkAchievement(
    @Param('id') gameId: string,
    @Body() body: { achievementId: string; value: number; data?: Record<string, any> }
  ) {
    const userId = 'current-user-id'
    return this.achievementService.checkAndUnlock(
      userId,
      gameId,
      body.achievementId,
      body.value,
      body.data
    )
  }

  @Get('users/me/achievements/:achievementId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get achievement detail' })
  @ApiResponse({ status: 200, description: 'Achievement detail' })
  async getAchievementDetail(@Param('achievementId') achievementId: string) {
    const userId = 'current-user-id'
    return this.achievementService.getAchievementDetail(userId, achievementId)
  }
}