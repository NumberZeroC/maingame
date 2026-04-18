import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MongooseModule } from '@nestjs/mongoose'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { CacheModule } from './common/cache'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { GamesModule } from './modules/games/games.module'
import { DrawGuessModule } from './modules/games/draw-guess/draw-guess.module'
import { AiModule } from './modules/ai/ai.module'
import { HealthModule } from './modules/health/health.module'
import { AchievementsModule } from './modules/achievements/achievements.module'
import { SocialModule } from './modules/social/social.module'
import { config } from './config/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'ai_game_platform',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),

    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_game_platform'),

    CacheModule,

    AuthModule,
    UsersModule,
    GamesModule,
    DrawGuessModule,
    AiModule,
    HealthModule,
    AchievementsModule,
    SocialModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
