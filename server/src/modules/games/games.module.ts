import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { GamesController } from './games.controller'
import { GamesService } from './games.service'
import {
  Game,
  GameSchema,
  GameSession,
  GameSessionSchema,
  GamePlayRecord,
  GamePlayRecordSchema,
  Leaderboard,
  LeaderboardSchema,
} from './game.schema'
import { CacheModule } from '../../common/cache'
import { DrawGuessModule } from './draw-guess/draw-guess.module'
import { NumberGuessModule } from './number-guess/number-guess.module'
import { WordChainModule } from './word-chain/word-chain.module'
import { TwentyQuestionsModule } from './twenty-questions/twenty-questions.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: GameSession.name, schema: GameSessionSchema },
      { name: GamePlayRecord.name, schema: GamePlayRecordSchema },
      { name: Leaderboard.name, schema: LeaderboardSchema },
    ]),
    CacheModule,
    DrawGuessModule,
    NumberGuessModule,
    WordChainModule,
    TwentyQuestionsModule,
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService, DrawGuessModule, NumberGuessModule, WordChainModule, TwentyQuestionsModule],
})
export class GamesModule {}
