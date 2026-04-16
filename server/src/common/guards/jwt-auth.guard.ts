import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const publicPaths = ['/auth/login', '/auth/register', '/health', '/api']
    if (publicPaths.some((path) => request.path.startsWith(path))) {
      return true
    }

    return super.canActivate(context)
  }
}
