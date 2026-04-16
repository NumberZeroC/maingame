import { IsString, IsOptional, MinLength, MaxLength, Matches, IsEmail } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nickname', example: 'NewNickname' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nickname must be at least 2 characters' })
  @MaxLength(20, { message: 'Nickname must be less than 20 characters' })
  nickname?: string

  @ApiPropertyOptional({ description: 'Email', example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string

  @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+\..+/, { message: 'Invalid avatar URL format' })
  avatar?: string
}
