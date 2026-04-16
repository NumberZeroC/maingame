import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

interface ErrorResponse {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
  requestId?: string
  details?: any
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const requestId = request.headers['x-request-id'] as string

    let status: number
    let message: string
    let error: string
    let details: any = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any
        message = resp.message || exception.message
        error = resp.error || this.getErrorName(status)
        details = resp.details
      } else {
        message = exceptionResponse as string
        error = this.getErrorName(status)
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = exception.message
      error = 'Internal Server Error'

      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        requestId ? `RequestID: ${requestId}` : ''
      )
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = 'Unknown error occurred'
      error = 'Internal Server Error'
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    }

    if (details && process.env.NODE_ENV !== 'production') {
      errorResponse.details = details
    }

    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : ''
      )
    } else if (status >= 400) {
      this.logger.warn(`[${requestId}] ${request.method} ${request.url} - ${status} - ${message}`)
    }

    response.status(status).json(errorResponse)
  }

  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    }
    return errorNames[status] || 'Error'
  }
}
