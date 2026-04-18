import { Controller, Post, Body, Sse, MessageEvent } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { Observable, map } from 'rxjs'
import { StreamService, StreamChunk } from './stream.service'
import { IsString, IsOptional, IsNumber, ValidateNested, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class StreamTextDto {
  @ApiProperty({ description: 'Prompt for text generation' })
  @IsString()
  prompt: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxTokens?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  temperature?: number
}

class StreamChatDto {
  @ApiProperty({ description: 'Chat messages' })
  messages: { role: 'user' | 'system' | 'assistant'; content: string }[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxTokens?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  temperature?: number
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post('text/stream')
  @ApiOperation({ summary: 'Stream text generation' })
  @ApiResponse({ status: 200, description: 'Streaming text' })
  streamText(@Body() dto: StreamTextDto): Observable<MessageEvent> {
    return this.streamService.createTextStream(dto.prompt, {
      maxTokens: dto.maxTokens,
      temperature: dto.temperature,
    }).pipe(
      map((chunk: StreamChunk) => ({
        data: JSON.stringify(chunk),
      }))
    )
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Stream chat generation' })
  @ApiResponse({ status: 200, description: 'Streaming chat' })
  streamChat(@Body() dto: StreamChatDto): Observable<MessageEvent> {
    return this.streamService.createChatStream(dto.messages, {
      maxTokens: dto.maxTokens,
      temperature: dto.temperature,
    }).pipe(
      map((chunk: StreamChunk) => ({
        data: JSON.stringify(chunk),
      }))
    )
  }
}