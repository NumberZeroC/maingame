import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards'
import { GamesService } from './games.service'
import { Game } from './game.schema'

@ApiTags('games')
@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published games' })
  @ApiResponse({ status: 200, description: 'Return list of published games' })
  async findAll(): Promise<Game[]> {
    return this.gamesService.findAll({ status: 'published' })
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get popular games leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Return popular games' })
  async getPopularGames(@Query('limit') limit?: string): Promise<Game[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.gamesService.getPopularGames(limitNum)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async findOne(@Param('id') id: string): Promise<Game | null> {
    return this.gamesService.findOne(id)
  }

  @Get(':id/manifest')
  @ApiOperation({ summary: 'Get game manifest' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Return game manifest' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getManifest(@Param('id') id: string): Promise<any> {
    return this.gamesService.getManifest(id)
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get game by slug' })
  @ApiParam({ name: 'slug', description: 'Game slug' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async findBySlug(@Param('slug') slug: string): Promise<Game | null> {
    return this.gamesService.findBySlug(slug)
  }

  @Get(':id/session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user game session' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Return game session' })
  async getSession(@Param('id') id: string, @Request() req: any): Promise<any> {
    return this.gamesService.getGameSession(req.user.id, id)
  }

  @Get(':id/session/load')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Load game session data' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiQuery({ name: 'key', required: false, description: 'Data key to load' })
  @ApiResponse({ status: 200, description: 'Return session data' })
  async loadSession(
    @Param('id') id: string,
    @Request() req: any,
    @Query('key') key?: string
  ): Promise<any> {
    const value = await this.gamesService.loadGameSession(req.user.id, id, key)
    return { value }
  }

  @Post(':id/session/save')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save game session data' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Session data saved' })
  async saveSession(
    @Param('id') id: string,
    @Body() body: { key: string; value: any },
    @Request() req: any
  ): Promise<void> {
    return this.gamesService.saveGameSession(req.user.id, id, body.key, body.value)
  }

  @Delete(':id/session/clear')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Clear game session data' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Session data cleared' })
  async clearSession(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.gamesService.clearGameSession(req.user.id, id)
  }

  @Post(':id/session/finish')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Finish game session' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        duration: { type: 'number' },
        data: { type: 'object' },
        achievements: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Session finished and recorded' })
  async finishSession(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any
  ): Promise<void> {
    return this.gamesService.finishGameSession(req.user.id, id, body)
  }

  @Get(':id/records')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user game play records' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return play records' })
  async getRecords(
    @Param('id') id: string,
    @Request() req: any,
    @Query('limit') limit?: string
  ): Promise<any[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.gamesService.getGamePlayRecords(req.user.id, id, limitNum)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Snake Game' },
        slug: { type: 'string', example: 'snake-game' },
        description: { type: 'string', example: 'Classic snake game' },
        category: { type: 'array', items: { type: 'string' }, example: ['arcade', 'classic'] },
        version: { type: 'string', example: '1.0.0' },
        thumbnail: { type: 'string', example: 'https://example.com/thumb.png' },
        banner: { type: 'string', example: 'https://example.com/banner.png' },
        entry: { type: 'string', example: '/games/snake' },
        status: { type: 'string', example: 'draft' },
        manifest: { type: 'object' },
        aiRequirements: { type: 'object' },
      },
      required: ['name', 'slug', 'entry'],
    },
  })
  @ApiResponse({ status: 201, description: 'Game created successfully' })
  async create(@Body() gameData: Partial<Game>): Promise<Game> {
    return this.gamesService.create(gameData)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game updated successfully' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async update(@Param('id') id: string, @Body() gameData: Partial<Game>): Promise<Game | null> {
    return this.gamesService.update(id, gameData)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game deleted successfully' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.gamesService.remove(id)
  }

  @Post(':id/leaderboard/submit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit score to leaderboard' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number', example: 1000 },
        extraData: { type: 'object' },
      },
      required: ['score'],
    },
  })
  @ApiResponse({ status: 200, description: 'Score submitted' })
  async submitScore(
    @Param('id') id: string,
    @Body() body: { score: number; extraData?: Record<string, any> },
    @Request() req: any
  ): Promise<any> {
    const entry = await this.gamesService.submitScore(req.user.id, id, body.score, body.extraData)
    return {
      success: true,
      score: entry.score,
      isNewRecord: entry.score === body.score,
    }
  }

  @Get(':id/leaderboard')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get game leaderboard' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiQuery({ name: 'type', required: false, enum: ['global', 'friends'], example: 'global' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, description: 'Return leaderboard entries' })
  async getGameLeaderboard(
    @Param('id') id: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string
  ): Promise<any[]> {
    const limitNum = limit ? parseInt(limit, 10) : 100
    return this.gamesService.getLeaderboard(id, type || 'global', limitNum)
  }

  @Get(':id/leaderboard/rank')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user rank in game leaderboard' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Return user rank' })
  async getUserRank(@Param('id') id: string, @Request() req: any): Promise<any> {
    return this.gamesService.getUserRank(req.user.id, id)
  }
}
