import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { AICoreService } from './ai-core.service'
import { AIConfigService } from './ai-config.service'
import { AIConfigFileService } from './ai-config-file.service'
import { AIConfigWatcherService } from './ai-config-watcher.service'
import { SpeechService } from './speech.service'
import { SpeechController } from './speech.controller'
import { StreamService } from './stream.service'
import { StreamController } from './stream.controller'

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AiController, SpeechController, StreamController],
  providers: [
    AIConfigService,
    AIConfigFileService,
    AIConfigWatcherService,
    AICoreService,
    AiService,
    SpeechService,
    StreamService,
  ],
  exports: [AICoreService, AIConfigService, AIConfigFileService, AIConfigWatcherService, AiService, SpeechService, StreamService],
})
export class AiModule {}
