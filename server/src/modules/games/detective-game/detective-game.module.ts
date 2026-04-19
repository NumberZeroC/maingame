import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DetectiveGameController } from './detective-game.controller'
import { DetectiveGameService } from './detective-game.service'
import { DetectiveGame, DetectiveGameSchema } from './detective-game.schema'
import { AiModule } from '../../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DetectiveGame.name, schema: DetectiveGameSchema }]),
    AiModule,
  ],
  controllers: [DetectiveGameController],
  providers: [DetectiveGameService],
  exports: [DetectiveGameService],
})
export class DetectiveGameModule {}