import { Controller, Get, Put, Body, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { User } from './user.entity'
import { UpdateUserDto } from './dto'

interface RequestWithUser {
  user: { id: string; phone: string }
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: RequestWithUser): Promise<User | null> {
    return this.usersService.findOne(req.user.id)
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async updateCurrentUser(
    @Request() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User | null> {
    return this.usersService.update(req.user.id, updateUserDto)
  }
}
