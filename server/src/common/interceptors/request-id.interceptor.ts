import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { v4 as uuidv4 } from 'uuid'

interface RequestWithId extends Request {
  requestId?: string
}

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithId>()

    let requestId = request.headers['x-request-id'] as string

    if (!requestId) {
      requestId = uuidv4()
      request.headers['x-request-id'] = requestId
    }

    request.requestId = requestId

    return next.handle()
  }
}
