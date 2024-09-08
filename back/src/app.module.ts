import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoConfig } from './configs/mongo.config';
import { CommunityModule } from './community/community.module';
import { APP_FILTER } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ExceptionToHttpExceptionFilter } from './common/exception-filter';
import { ChatModule } from './chat/chat.module';
import { PurchaseModule } from './purchase/purchase.module';
import { LoggerModule } from './logger/logger.module';
import { AxiosModule } from './axios/axios.module';
import { BullModule } from '@nestjs/bullmq';

import * as config from 'config';
const redisConfig = config.get('redis');

@Module({
  imports: [
    // Import Database
    BullModule.forRoot({
      connection: {
        host: redisConfig.url,
        port: 6379,
      },
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    MongooseModule.forRoot(mongoConfig.uri),
    UserModule,
    CommunityModule,
    ChatModule,
    OrderModule,
    PurchaseModule,
    LoggerModule,
    AxiosModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: ExceptionToHttpExceptionFilter },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
