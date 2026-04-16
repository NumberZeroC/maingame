import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
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
  @ApiOperation({ summary: 'Get game leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Return game leaderboard' })
  async getLeaderboard(@Query('limit') limit?: string): Promise<Game[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10
    return this.gamesService.getLeaderboard(limitNum)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Return game details' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async findOne(@Param('id') id: string): Promise<Game | null> {
    return this.gamesService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Snake Game' },
        description: { type: 'string', example: 'Classic snake game' },
        category: { type: 'array', items: { type: 'string' }, example: ['arcade', 'classic'] },
        version: { type: 'string', example: '1.0.0' },
        thumbnail: { type: 'string', example: 'https://example.com/thumb.png' },
        banner: { type: 'string', example: 'https://example.com/banner.png' },
        entry: { type: 'string', example: '/games/snake' },
        status: { type: 'string', example: 'draft' },
      },
      required: ['name'],
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
}
