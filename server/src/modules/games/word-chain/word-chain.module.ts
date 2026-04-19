import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { WordChainController } from './word-chain.controller'
import { WordChainService } from './word-chain.service'
import { WordChainGame, WordChainGameSchema } from './word-chain.schema'
import { AiModule } from '../../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WordChainGame.name, schema: WordChainGameSchema }]),
    AiModule,
  ],
  controllers: [WordChainController],
  providers: [WordChainService],
  exports: [WordChainService],
})
export class WordChainModule {}