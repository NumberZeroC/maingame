import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { DrawGuessService } from './draw-guess.service'
import { DrawGuessGame } from './draw-guess.schema'

@ApiTags('draw-guess')
@ApiBearerAuth()
@Controller('draw-guess')
export class DrawGuessController {
  constructor(private readonly drawGuessService: DrawGuessService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new draw-guess game' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['animals', 'plants', 'objects', 'food', 'nature'],
          example: 'animals',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Game started successfully' })
  async startGame(
    @Request() req: any,
    @Body() body: { category?: 'animals' | 'plants' | 'objects' | 'food' | 'nature' }
  ): Promise<DrawGuessGame> {
    return this.drawGuessService.startGame(req.user.id, body.category)
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get draw-guess leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Return leaderboard' })
  async getLeaderboard(@Query('limit') limit?: string): Promise<DrawGuessGame[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.drawGuessService.getLeaderboard(limitNum)
  }

  @Get('user/history')
  @ApiOperation({ summary: 'Get user game history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Return user game history' })
  async getUserHistory(
    @Request() req: any,
    @Query('limit') limit?: string
  ): Promise<DrawGuessGame[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.drawGuessService.getUserGames(req.user.id, limitNum)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getGame(@Param('id') id: string): Promise<DrawGuessGame | null> {
    return this.drawGuessService.getGame(id)
  }

  @Post(':id/guess')
  @ApiOperation({ summary: 'Submit a guess for the game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        guess: { type: 'string', example: '猫' },
      },
      required: ['guess'],
    },
  })
  @ApiResponse({ status: 200, description: 'Guess result' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async guess(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { guess: string }
  ): Promise<{ correct: boolean; message: string; game: DrawGuessGame }> {
    return this.drawGuessService.guess(id, req.user.id, body.guess)
  }

  @Post(':id/finish')
  @ApiOperation({ summary: 'Finish the game (timeout or give up)' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timeRemaining: { type: 'number', example: 30 },
      },
      required: ['timeRemaining'],
    },
  })
  @ApiResponse({ status: 200, description: 'Game finished' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async finishGame(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { timeRemaining: number }
  ): Promise<DrawGuessGame> {
    return this.drawGuessService.finishGame(id, req.user.id, body.timeRemaining)
  }
}
