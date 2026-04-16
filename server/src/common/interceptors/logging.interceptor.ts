import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request, Response } from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const requestId = (request.headers['x-request-id'] as string) || 'unknown'
    const method = request.method
    const url = request.url
    const userAgent = request.headers['user-agent'] || 'unknown'
    const ip = request.ip || request.connection.remoteAddress || 'unknown'

    const startTime = Date.now()

    this.logger.log(
      `[${requestId}] --> ${method} ${url} | IP: ${ip} | UA: ${userAgent.substring(0, 50)}`
    )

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime
          const statusCode = response.statusCode
          const contentLength = response.get('content-length') || 0

          this.logger.log(
            `[${requestId}] <-- ${method} ${url} | ${statusCode} | ${duration}ms | ${contentLength}bytes`
          )
        },
        error: (error) => {
          const duration = Date.now() - startTime
          this.logger.error(
            `[${requestId}] <-- ${method} ${url} | ERROR | ${duration}ms | ${error.message}`
          )
        },
      })
    )
  }
}
