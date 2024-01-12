import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ItemModule } from './item/item.module';
import { CommunityModule } from './community/community.module';
import { APP_FILTER } from '@nestjs/core';
import { ServiceExceptionToHttpExceptionFilter } from './common/exception-filter';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    BoardsModule,
    ItemModule,
    CommunityModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: ServiceExceptionToHttpExceptionFilter },
  ],
})
export class AppModule {}
