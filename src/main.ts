import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig = config.get('server');
  app.setGlobalPrefix('/api');
  app.enableCors({
    origin: ['http://localhost:3000/', 'kdt-ai-9-team01.elicecoding.com'],
    credentials: true,
  });
  app.use(cookieParser());

  await app.listen(serverConfig.port);
  Logger.log(`Application running on port ${serverConfig.port}`);
}
bootstrap();
