import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { TwentyQuestionsService } from './twenty-questions.service'
import { TwentyQuestionsGame } from './twenty-questions.schema'

@ApiTags('twenty-questions')
@ApiBearerAuth()
@Controller('twenty-questions')
export class TwentyQuestionsController {
  constructor(private readonly twentyQuestionsService: TwentyQuestionsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new twenty questions game' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { category: { type: 'string', example: '动物' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Game started successfully' })
  async startGame(
    @Request() req: any,
    @Body() body: { category?: string }
  ): Promise<TwentyQuestionsGame> {
    return this.twentyQuestionsService.startGame(req.user.id, body.category)
  }

  @Post(':id/ask')
  @ApiOperation({ summary: 'Ask a yes/no question' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { question: { type: 'string', example: '它是动物吗？' } },
      required: ['question'],
    },
  })
  @ApiResponse({ status: 200, description: 'Question answer' })
  async ask(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { question: string }
  ): Promise<{ answer: string; message: string; game: TwentyQuestionsGame }> {
    return this.twentyQuestionsService.ask(id, req.user.id, body.question)
  }

  @Post(':id/guess')
  @ApiOperation({ summary: 'Guess the answer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { guess: { type: 'string', example: '猫' } },
      required: ['guess'],
    },
  })
  @ApiResponse({ status: 200, description: 'Guess result' })
  async guess(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { guess: string }
  ): Promise<{ correct: boolean; message: string; game: TwentyQuestionsGame }> {
    return this.twentyQuestionsService.guess(id, req.user.id, body.guess)
  }

  @Post(':id/give-up')
  @ApiOperation({ summary: 'Give up the game' })
  @ApiResponse({ status: 200, description: 'Game ended' })
  async giveUp(@Param('id') id: string, @Request() req: any): Promise<TwentyQuestionsGame> {
    return this.twentyQuestionsService.giveUp(id, req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  async getGame(@Param('id') id: string): Promise<TwentyQuestionsGame | null> {
    return this.twentyQuestionsService.getGame(id)
  }

  @Get('user/history')
  @ApiOperation({ summary: 'Get user game history' })
  @ApiResponse({ status: 200, description: 'Return user game history' })
  async getUserHistory(
    @Request() req: any,
    @Query('limit') limit?: string
  ): Promise<TwentyQuestionsGame[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.twentyQuestionsService.getUserGames(req.user.id, limitNum)
  }
}