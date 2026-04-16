import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { GamesController } from './games.controller'
import { GamesService } from './games.service'
import { Game, GameSchema } from './game.schema'
import { CacheModule } from '../../common/cache'

@Module({
  imports: [MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]), CacheModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
