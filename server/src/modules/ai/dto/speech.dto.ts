import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class TextToSpeechDto {
  @ApiProperty({ description: 'Text to convert to speech' })
  @IsString()
  text: string

  @ApiPropertyOptional({ enum: ['male', 'female', 'child'], default: 'female' })
  @IsOptional()
  @IsEnum(['male', 'female', 'child'])
  voice?: 'male' | 'female' | 'child'

  @ApiPropertyOptional({ default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  speed?: number

  @ApiPropertyOptional({ enum: ['mp3', 'wav'], default: 'mp3' })
  @IsOptional()
  @IsEnum(['mp3', 'wav'])
  format?: 'mp3' | 'wav'

  @ApiPropertyOptional({ default: 'zh-CN' })
  @IsOptional()
  @IsString()
  language?: string
}

export class SpeechToTextDto {
  @ApiProperty({ description: 'Audio data (base64 or URL)' })
  @IsString()
  audio: string

  @ApiPropertyOptional({ default: 'zh-CN' })
  @IsOptional()
  @IsString()
  language?: string
}