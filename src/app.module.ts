import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ItemModule } from './item/item.module';
import { CommunityModule } from './community/community.module';
import { APP_FILTER } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ExceptionToHttpExceptionFilter } from './common/exception-filter';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UserModule,
    CommunityModule,
    OrderModule,
    ItemModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: ExceptionToHttpExceptionFilter },
  ],
})
export class AppModule {}
