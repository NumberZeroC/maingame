import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TwentyQuestionsController } from './twenty-questions.controller'
import { TwentyQuestionsService } from './twenty-questions.service'
import { TwentyQuestionsGame, TwentyQuestionsGameSchema } from './twenty-questions.schema'
import { AiModule } from '../../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TwentyQuestionsGame.name, schema: TwentyQuestionsGameSchema }]),
    AiModule,
  ],
  controllers: [TwentyQuestionsController],
  providers: [TwentyQuestionsService],
  exports: [TwentyQuestionsService],
})
export class TwentyQuestionsModule {}