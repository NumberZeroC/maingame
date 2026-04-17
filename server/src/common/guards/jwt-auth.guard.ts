import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const publicPaths = ['/auth/login', '/auth/register', '/health', '/api', '/games']
    const publicGetPaths = ['/games/', '/draw-guess/leaderboard']
    if (publicPaths.some((path) => request.path.startsWith(path))) {
      return true
    }
    if (request.method === 'GET' && publicGetPaths.some((path) => request.path.startsWith(path))) {
      const pathParts = request.path.split('/')
      if (pathParts.length <= 3 || pathParts[2] === 'slug' || pathParts[2] === 'leaderboard') {
        return true
      }
    }

    return super.canActivate(context)
  }
}
