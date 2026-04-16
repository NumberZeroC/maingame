import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { AICoreService } from './ai-core.service'
import { AIConfigService } from './ai-config.service'

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AIConfigService, AICoreService, AiService],
  exports: [AICoreService, AIConfigService, AiService],
})
export class AiModule {}
