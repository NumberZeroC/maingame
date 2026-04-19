import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { NumberGuessService } from './number-guess.service'
import { NumberGuessGame } from './number-guess.schema'

@ApiTags('number-guess')
@ApiBearerAuth()
@Controller('number-guess')
export class NumberGuessController {
  constructor(private readonly numberGuessService: NumberGuessService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new number guess game' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        minRange: { type: 'number', example: 1 },
        maxRange: { type: 'number', example: 100 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Game started successfully' })
  async startGame(
    @Request() req: any,
    @Body() body: { minRange?: number; maxRange?: number }
  ): Promise<NumberGuessGame> {
    const min = body.minRange ?? 1
    const max = body.maxRange ?? 100
    return this.numberGuessService.startGame(req.user.id, min, max)
  }

  @Post(':id/guess')
  @ApiOperation({ summary: 'Submit a guess' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { guess: { type: 'number', example: 50 } },
      required: ['guess'],
    },
  })
  @ApiResponse({ status: 200, description: 'Guess result' })
  async guess(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { guess: number }
  ): Promise<{ correct: boolean; result: string; message: string; game: NumberGuessGame }> {
    return this.numberGuessService.guess(id, req.user.id, body.guess)
  }

  @Post(':id/give-up')
  @ApiOperation({ summary: 'Give up and reveal answer' })
  @ApiResponse({ status: 200, description: 'Game ended' })
  async giveUp(@Param('id') id: string, @Request() req: any): Promise<NumberGuessGame> {
    return this.numberGuessService.giveUp(id, req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  async getGame(@Param('id') id: string): Promise<NumberGuessGame | null> {
    return this.numberGuessService.getGame(id)
  }

  @Get('user/history')
  @ApiOperation({ summary: 'Get user game history' })
  @ApiResponse({ status: 200, description: 'Return user game history' })
  async getUserHistory(@Request() req: any, @Query('limit') limit?: string): Promise<NumberGuessGame[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.numberGuessService.getUserGames(req.user.id, limitNum)
  }
}