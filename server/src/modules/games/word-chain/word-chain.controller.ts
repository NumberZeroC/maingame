import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { WordChainService } from './word-chain.service'
import { WordChainGame } from './word-chain.schema'

@ApiTags('word-chain')
@ApiBearerAuth()
@Controller('word-chain')
export class WordChainController {
  constructor(private readonly wordChainService: WordChainService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new word chain game' })
  @ApiResponse({ status: 201, description: 'Game started successfully' })
  async startGame(@Request() req: any): Promise<WordChainGame> {
    return this.wordChainService.startGame(req.user.id)
  }

  @Post(':id/play')
  @ApiOperation({ summary: 'Submit a word for the chain' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { word: { type: 'string', example: '心情' } },
      required: ['word'],
    },
  })
  @ApiResponse({ status: 200, description: 'Play result' })
  async play(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { word: string }
  ): Promise<{ success: boolean; message: string; nextWord: string | null; game: WordChainGame }> {
    return this.wordChainService.play(id, req.user.id, body.word)
  }

  @Post(':id/give-up')
  @ApiOperation({ summary: 'Give up the game' })
  @ApiResponse({ status: 200, description: 'Game ended' })
  async giveUp(@Param('id') id: string, @Request() req: any): Promise<WordChainGame> {
    return this.wordChainService.giveUp(id, req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  async getGame(@Param('id') id: string): Promise<WordChainGame | null> {
    return this.wordChainService.getGame(id)
  }

  @Get('user/history')
  @ApiOperation({ summary: 'Get user game history' })
  @ApiResponse({ status: 200, description: 'Return user game history' })
  async getUserHistory(@Request() req: any, @Query('limit') limit?: string): Promise<WordChainGame[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.wordChainService.getUserGames(req.user.id, limitNum)
  }
}