import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ description: 'Phone number', example: '13800138000' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone: string

  @ApiProperty({ description: 'Password', example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(32, { message: 'Password must be less than 32 characters' })
  password: string
}

export class RegisterDto {
  @ApiProperty({ description: 'Phone number', example: '13800138000' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone: string

  @ApiProperty({ description: 'Password', example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(32, { message: 'Password must be less than 32 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]{8,32}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string

  @ApiProperty({ description: 'Nickname', example: 'Player1' })
  @IsString()
  @IsNotEmpty({ message: 'Nickname is required' })
  @MinLength(2, { message: 'Nickname must be at least 2 characters' })
  @MaxLength(20, { message: 'Nickname must be less than 20 characters' })
  nickname: string
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string
}
