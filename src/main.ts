import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setSwagger } from './common/swagger.setting';
import * as config from 'config';
import * as cookieParser from 'cookie-parser';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig = config.get('server');
  mongoose.set('debug', true);
  app.setGlobalPrefix('/api');
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'kdt-ai-9-team01.elicecoding.com',
      'https://developers.tosspayments.com',
      'https://api.tosspayments.com',
    ],
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  setSwagger(app);

  await app.listen(serverConfig.port);
  Logger.log(`Application running on port ${serverConfig.port}`);
}
bootstrap();
