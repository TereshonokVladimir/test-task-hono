import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request
    const correlationId = request.headers['x-correlation-id'] || 'N/A'
    const startTime = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime
          this.logger.log(`[${correlationId}] ${method} ${url} - ${duration}ms`)
        },
        error: error => {
          const duration = Date.now() - startTime
          this.logger.error(
            `[${correlationId}] ${method} ${url} - ${duration}ms - ${error.message}`
          )
        },
      })
    )
  }
}
