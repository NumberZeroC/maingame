import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { AIConfigFileService } from './ai-config-file.service'
import { AICoreService } from './ai-core.service'

@Injectable()
export class AIConfigWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AIConfigWatcherService.name)
  private watchers: fs.FSWatcher[] = []
  private configDir: string
  private reloadTimeout: NodeJS.Timeout | null = null

  constructor(
    private readonly configFileService: AIConfigFileService,
    private readonly aiCoreService: AICoreService
  ) {
    this.configDir = process.env.AI_CONFIG_DIR || path.join(process.cwd(), 'config')
  }

  onModuleInit() {
    this.startWatching()
    this.logger.log('AI config watcher started')
  }

  onModuleDestroy() {
    this.stopWatching()
    this.logger.log('AI config watcher stopped')
  }

  private startWatching() {
    const codingplanPath = path.join(this.configDir, 'codingplan.json')
    const providersPath = path.join(this.configDir, 'ai-providers.json')

    if (fs.existsSync(codingplanPath)) {
      const watcher = fs.watch(codingplanPath, (eventType) => {
        if (eventType === 'change') {
          this.logger.log(`CodingPlan config changed, reloading...`)
          this.scheduleReload()
        }
      })
      this.watchers.push(watcher)
    }

    if (fs.existsSync(providersPath)) {
      const watcher = fs.watch(providersPath, (eventType) => {
        if (eventType === 'change') {
          this.logger.log(`AI providers config changed, reloading...`)
          this.scheduleReload()
        }
      })
      this.watchers.push(watcher)
    }
  }

  private stopWatching() {
    for (const watcher of this.watchers) {
      watcher.close()
    }
    this.watchers = []
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout)
      this.reloadTimeout = null
    }
  }

  private scheduleReload() {
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout)
    }
    this.reloadTimeout = setTimeout(() => {
      this.reloadConfig()
      this.reloadTimeout = null
    }, 500)
  }

  reloadConfig() {
    try {
      this.configFileService.reloadConfig()
      this.aiCoreService.reloadProviders()
      this.logger.log('AI config hot reload completed')
    } catch (error) {
      this.logger.error(`Failed to reload config: ${error}`)
    }
  }

  manualReload() {
    this.logger.log('Manual config reload triggered')
    this.reloadConfig()
    return {
      success: true,
      message: 'AI config reloaded successfully',
      timestamp: new Date(),
      currentModel: this.configFileService.getCurrentCodingPlanModel(),
      codingPlanEnabled: this.configFileService.isCodingPlanEnabled(),
    }
  }
}
