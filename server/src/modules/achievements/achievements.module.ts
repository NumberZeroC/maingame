import { Module } from '@nestjs/common'
import { AchievementService, AchievementModels } from './achievement.service'
import { AchievementController } from './achievement.controller'

@Module({
  imports: [AchievementModels],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementsModule {}