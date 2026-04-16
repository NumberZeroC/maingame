import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request } from 'express'
import { CacheService } from '../cache'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message: string
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 5,
  message: 'Too many requests, please try again later',
}

const LOGIN_CONFIG: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 5,
  message: 'Too many login attempts, please try again after 1 minute',
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private cacheService: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const ip = request.ip || request.connection.remoteAddress || 'unknown'
    const path = request.path

    const config = this.getConfig(path)

    const key = `rate-limit:${path}:${ip}`
    const current = await this.cacheService.get<number>(key)

    if (current === null) {
      await this.cacheService.set(key, 1, config.windowMs / 1000)
      return true
    }

    if (current >= config.maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: config.message,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    await this.cacheService.set(key, current + 1, config.windowMs / 1000)
    return true
  }

  private getConfig(path: string): RateLimitConfig {
    if (path.includes('/auth/login')) {
      return LOGIN_CONFIG
    }
    return DEFAULT_CONFIG
  }
}
