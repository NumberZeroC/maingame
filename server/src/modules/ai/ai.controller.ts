import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { AICoreService } from './ai-core.service'
import { AIConfigService } from './ai-config.service'
import { GenerateTextDto, ChatDto, GenerateImageDto } from './dto'
import { AIProviderType } from './interfaces'

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiCoreService: AICoreService,
    private readonly configService: AIConfigService
  ) {}

  @Post('text/generate')
  @ApiOperation({ summary: 'Generate text using AI with fallback support' })
  @ApiResponse({ status: 200, description: 'Text generated successfully' })
  @ApiResponse({ status: 500, description: 'AI generation failed' })
  async generateText(@Body() dto: GenerateTextDto) {
    return this.aiCoreService.generateText(dto.prompt, dto.options)
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI with fallback support' })
  @ApiResponse({ status: 200, description: 'Chat response generated successfully' })
  @ApiResponse({ status: 500, description: 'AI chat failed' })
  async chat(@Body() dto: ChatDto) {
    return this.aiCoreService.chat(dto.messages, dto.options)
  }

  @Post('image/generate')
  @ApiOperation({ summary: 'Generate image using AI' })
  @ApiResponse({ status: 200, description: 'Image generated successfully' })
  @ApiResponse({ status: 500, description: 'Image generation failed' })
  async generateImage(@Body() dto: GenerateImageDto) {
    return this.aiCoreService.generateImage(dto.prompt, dto.options)
  }

  @Get('models')
  @ApiOperation({ summary: 'List available AI models' })
  @ApiQuery({ name: 'provider', required: false, description: 'Filter by provider' })
  @ApiResponse({ status: 200, description: 'List of models' })
  async listModels(@Query('provider') provider?: AIProviderType) {
    return {
      models: await this.aiCoreService.listModels(provider),
    }
  }

  @Get('providers')
  @ApiOperation({ summary: 'List available AI providers' })
  @ApiResponse({ status: 200, description: 'List of providers' })
  listProviders() {
    return {
      providers: this.aiCoreService.getAvailableProviders(),
      defaultProvider: this.configService.getDefaultProvider(),
      fallbackOrder: this.configService.getFallbackOrder(),
    }
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  @ApiQuery({ name: 'provider', required: false, description: 'Filter by provider' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  getUsageStats(@Query('provider') provider?: AIProviderType) {
    return {
      stats: this.aiCoreService.getUsageStats(provider),
      totalCost: this.aiCoreService.getTotalCost(),
    }
  }

  @Post('estimate-cost')
  @ApiOperation({ summary: 'Estimate cost for a request' })
  @ApiResponse({ status: 200, description: 'Estimated cost' })
  estimateCost(
    @Body()
    body: {
      provider: AIProviderType
      model: string
      promptTokens: number
      completionTokens: number
    }
  ) {
    const cost = this.aiCoreService.estimateCost(
      body.provider,
      body.model,
      body.promptTokens,
      body.completionTokens
    )
    return { cost, currency: 'USD' }
  }

  @Get('config')
  @ApiOperation({ summary: 'Get AI configuration' })
  @ApiResponse({ status: 200, description: 'AI configuration' })
  getConfig() {
    const config = this.configService.getConfig()
    return {
      defaultProvider: config.defaultProvider,
      fallbackEnabled: config.fallbackEnabled,
      fallbackOrder: config.fallbackOrder,
      rateLimit: config.rateLimit,
      costTracking: config.costTracking,
      enabledProviders: this.configService.getEnabledProviders(),
    }
  }
}
