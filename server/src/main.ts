import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'
dotenvConfig({ path: resolve(__dirname, '../../../.env') })

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters'
import { LoggingInterceptor, RequestIdInterceptor } from './common/interceptors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  app.useGlobalFilters(new AllExceptionsFilter())

  app.useGlobalInterceptors(new RequestIdInterceptor())
  app.useGlobalInterceptors(new LoggingInterceptor())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    })
  )

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : []

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Accept', 'Origin'],
    exposedHeaders: ['X-Request-Id'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })

  const config = new DocumentBuilder()
    .setTitle('AI Game Platform API')
    .setDescription('API documentation for the AI Game Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = process.env.PORT || 4000
  const host = process.env.HOST || '0.0.0.0'
  const publicIp = process.env.PUBLIC_IP || '8.130.165.124'
  await app.listen(port, host)

  console.log(`🚀 Server running on http://${publicIp}:${port}`)
  console.log(`📚 API documentation available at http://${publicIp}:${port}/api`)
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`)
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error)
  process.exit(1)
})
