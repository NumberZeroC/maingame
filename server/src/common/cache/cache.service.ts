import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null
  private isConnected = false

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('app.redis.host') || 'localhost'
    const port = this.configService.get<number>('app.redis.port') || 6379
    const password = this.configService.get<string>('app.redis.password') || ''

    try {
      const url = password
        ? `redis://:${password}@${host}:${port}`
        : `redis://${host}:${port}`

      this.client = createClient({ url })

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        console.log('Redis Client Connected')
        this.isConnected = true
      })

      await this.client.connect()
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      this.isConnected = false
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit()
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null
    }
    try {
      const data = await this.client.get(key)
      if (!data) return null
      return JSON.parse(data) as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      return
    }
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return
    }
    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Cache del error:', error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return
    }
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
    } catch (error) {
      console.error('Cache delPattern error:', error)
    }
  }
}
