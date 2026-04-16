import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { AICoreService } from './ai-core.service'
import { AIConfigService } from './ai-config.service'
import { AIConfigFileService } from './ai-config-file.service'
import { AIConfigWatcherService } from './ai-config-watcher.service'

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AIConfigService,
    AIConfigFileService,
    AIConfigWatcherService,
    AICoreService,
    AiService,
  ],
  exports: [AICoreService, AIConfigService, AIConfigFileService, AIConfigWatcherService, AiService],
})
export class AiModule {}
