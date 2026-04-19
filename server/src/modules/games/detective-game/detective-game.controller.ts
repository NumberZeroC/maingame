import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { DetectiveGameService } from './detective-game.service'
import { DetectiveGame } from './detective-game.schema'

@ApiTags('detective-game')
@ApiBearerAuth()
@Controller('detective-game')
export class DetectiveGameController {
  constructor(private readonly detectiveGameService: DetectiveGameService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new detective game' })
  @ApiResponse({ status: 201, description: 'Game started successfully' })
  async startGame(@Request() req: any): Promise<DetectiveGame> {
    return this.detectiveGameService.startGame(req.user.id)
  }

  @Post(':id/question')
  @ApiOperation({ summary: 'Question a suspect' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        suspectId: { type: 'string', example: 'suspect-0' },
        question: { type: 'string', example: '案发时你在哪里？' },
      },
      required: ['suspectId', 'question'],
    },
  })
  @ApiResponse({ status: 200, description: 'Suspect response' })
  async questionSuspect(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { suspectId: string; question: string }
  ): Promise<{ response: string; game: DetectiveGame; questionsRemaining: number }> {
    return this.detectiveGameService.questionSuspect(id, req.user.id, body.suspectId, body.question)
  }

  @Post(':id/investigate')
  @ApiOperation({ summary: 'Investigate a clue' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { clueId: { type: 'string', example: 'clue-1' } },
      required: ['clueId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Clue discovery' })
  async investigateClue(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { clueId: string }
  ): Promise<{ discovery: string; game: DetectiveGame }> {
    return this.detectiveGameService.investigateClue(id, req.user.id, body.clueId)
  }

  @Post(':id/deduce')
  @ApiOperation({ summary: 'Make a deduction' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { statement: { type: 'string', example: '我认为凶手是张伟，因为他有作案动机' } },
      required: ['statement'],
    },
  })
  @ApiResponse({ status: 200, description: 'Deduction feedback' })
  async makeDeduction(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { statement: string }
  ): Promise<{ feedback: string; correct: boolean; game: DetectiveGame }> {
    return this.detectiveGameService.makeDeduction(id, req.user.id, body.statement)
  }

  @Post(':id/accuse')
  @ApiOperation({ summary: 'Accuse a suspect' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        suspectId: { type: 'string', example: 'suspect-0' },
        reasoning: { type: 'string', example: '根据监控和指纹证据' },
      },
      required: ['suspectId', 'reasoning'],
    },
  })
  @ApiResponse({ status: 200, description: 'Accusation result' })
  async accuse(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { suspectId: string; reasoning: string }
  ): Promise<{ correct: boolean; message: string; game: DetectiveGame }> {
    return this.detectiveGameService.accuse(id, req.user.id, body.suspectId, body.reasoning)
  }

  @Post(':id/give-up')
  @ApiOperation({ summary: 'Give up the investigation' })
  @ApiResponse({ status: 200, description: 'Game ended' })
  async giveUp(@Param('id') id: string, @Request() req: any): Promise<DetectiveGame> {
    return this.detectiveGameService.giveUp(id, req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  async getGame(@Param('id') id: string): Promise<DetectiveGame | null> {
    return this.detectiveGameService.getGame(id)
  }

  @Get('user/history')
  @ApiOperation({ summary: 'Get user game history' })
  @ApiResponse({ status: 200, description: 'Return user game history' })
  async getUserHistory(@Request() req: any, @Query('limit') limit?: string): Promise<DetectiveGame[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.detectiveGameService.getUserGames(req.user.id, limitNum)
  }
}