import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './controllers/item.controller';
import { ItemService } from './services/item.service';
import { Item } from './entities/item.entity';
import { ItemRepository } from './repositories/item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository],
})
export class ItemModule {}
