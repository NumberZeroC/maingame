import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { NumberGuessController } from './number-guess.controller'
import { NumberGuessService } from './number-guess.service'
import { NumberGuessGame, NumberGuessGameSchema } from './number-guess.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NumberGuessGame.name, schema: NumberGuessGameSchema }]),
  ],
  controllers: [NumberGuessController],
  providers: [NumberGuessService],
  exports: [NumberGuessService],
})
export class NumberGuessModule {}