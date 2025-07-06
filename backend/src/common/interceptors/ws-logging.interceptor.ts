import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('WebSocket');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const event = context.switchToWs().getPattern();
    const data = context.switchToWs().getData();
    const now = Date.now();

    this.logger.log(`Event: ${event} - Client: ${client.id}`);
    this.logger.debug(`Data: ${JSON.stringify(data)}`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Event: ${event} - Client: ${client.id} - ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Event: ${event} - Client: ${client.id} - ERROR - ${responseTime}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}