import { registerAs } from '@nestjs/config'

function validateJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production')
    }
    console.warn(
      'WARNING: JWT_SECRET is not set. Using default secret for development. DO NOT use in production!'
    )
    return 'dev-secret-change-in-production'
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }

  return secret
}

export const config = registerAs('app', () => ({
  jwt: {
    secret: validateJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    },
    stability: {
      apiKey: process.env.STABILITY_API_KEY,
    },
  },
  rateLimit: {
    loginMaxRequests: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5'),
    loginWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '60000'),
    apiMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX || '100'),
    apiWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000'),
  },
}))
