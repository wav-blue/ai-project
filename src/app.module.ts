import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ItemModule } from './modules/item/item.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), BoardsModule, ItemModule],
})
export class AppModule {}
