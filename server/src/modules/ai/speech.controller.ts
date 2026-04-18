import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { SpeechService } from './speech.service'
import { TextToSpeechDto, SpeechToTextDto } from './dto/speech.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('speech/generate')
  @ApiOperation({ summary: 'Convert text to speech (TTS)' })
  @ApiResponse({ status: 200, description: 'Speech generated successfully' })
  @ApiResponse({ status: 500, description: 'Speech generation failed' })
  async textToSpeech(@Body() dto: TextToSpeechDto) {
    return this.speechService.textToSpeech(dto.text, {
      voice: dto.voice,
      speed: dto.speed,
      format: dto.format,
      language: dto.language,
    })
  }

  @Post('speech/recognize')
  @ApiOperation({ summary: 'Convert speech to text (STT)' })
  @ApiResponse({ status: 200, description: 'Speech recognized successfully' })
  @ApiResponse({ status: 500, description: 'Speech recognition failed' })
  async speechToText(@Body() dto: SpeechToTextDto) {
    return this.speechService.speechToText(dto.audio, {
      language: dto.language,
    })
  }
}