import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsEnum,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class TextGenerationOptionsDto {
  @ApiPropertyOptional({ description: 'Maximum tokens to generate' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTokens?: number

  @ApiPropertyOptional({ description: 'Temperature for generation', minimum: 0, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number

  @ApiPropertyOptional({ description: 'Top P sampling' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  topP?: number

  @ApiPropertyOptional({ description: 'Stop sequences' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stop?: string[]

  @ApiPropertyOptional({ description: 'Model to use' })
  @IsOptional()
  @IsString()
  model?: string
}

export class GenerateTextDto {
  @ApiProperty({ description: 'Prompt for text generation' })
  @IsString()
  prompt: string

  @ApiPropertyOptional({ type: TextGenerationOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TextGenerationOptionsDto)
  options?: TextGenerationOptionsDto
}

export class ChatMessageDto {
  @ApiProperty({ description: 'Role of the message sender', enum: ['system', 'user', 'assistant'] })
  @IsEnum(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant'

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  content: string
}

export class ChatDto {
  @ApiProperty({ description: 'Array of chat messages', type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[]

  @ApiPropertyOptional({ type: TextGenerationOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TextGenerationOptionsDto)
  options?: TextGenerationOptionsDto
}

export class ImageGenerationOptionsDto {
  @ApiPropertyOptional({ description: 'Model to use for image generation' })
  @IsOptional()
  @IsString()
  model?: string

  @ApiPropertyOptional({
    description: 'Image size',
    enum: ['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'],
  })
  @IsOptional()
  @IsEnum(['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'])
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024'

  @ApiPropertyOptional({ description: 'Image quality', enum: ['standard', 'hd'] })
  @IsOptional()
  @IsEnum(['standard', 'hd'])
  quality?: 'standard' | 'hd'

  @ApiPropertyOptional({ description: 'Number of images to generate' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  n?: number
}

export class GenerateImageDto {
  @ApiProperty({ description: 'Prompt for image generation' })
  @IsString()
  prompt: string

  @ApiPropertyOptional({ type: ImageGenerationOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImageGenerationOptionsDto)
  options?: ImageGenerationOptionsDto
}
