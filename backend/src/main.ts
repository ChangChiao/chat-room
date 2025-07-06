import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const logger = new Logger('Bootstrap');

  // 全域錯誤處理
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全域日誌攔截器
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // 全域驗證管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // 啟用 CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 提供靜態檔案服務（用於測試頁面）
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Socket.IO test page: http://localhost:${port}/test-socket.html`);
}
bootstrap();
