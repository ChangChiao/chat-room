import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    
    let error = 'Unknown error';
    let message = 'An error occurred';

    if (exception instanceof WsException) {
      error = exception.name;
      message = exception.message;
    } else if (exception instanceof Error) {
      error = exception.name;
      message = exception.message;
    }

    // 記錄錯誤
    this.logger.error(
      `WebSocket Error: ${message}`,
      {
        error: error,
        message: message,
        clientId: client.id,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
    );

    // 發送錯誤給客戶端
    client.emit('error', {
      error: error,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}