import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DrawGuessController } from './draw-guess.controller'
import { DrawGuessService } from './draw-guess.service'
import { DrawGuessGame, DrawGuessGameSchema } from './draw-guess.schema'
import { AiModule } from '../../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DrawGuessGame.name, schema: DrawGuessGameSchema }]),
    AiModule,
  ],
  controllers: [DrawGuessController],
  providers: [DrawGuessService],
  exports: [DrawGuessService],
})
export class DrawGuessModule {}
