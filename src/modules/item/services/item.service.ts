import { Injectable, Logger } from '@nestjs/common';
import { Item } from '../entities/item.entity';
import { ItemRepository } from '../repositories/item.repository';
import { CreateItemDto } from '../dtos/create-item.dto';

@Injectable()
export class ItemService {
  constructor(private itemRepository: ItemRepository) {}

  async getAllItems(): Promise<Item[]> {
    new Logger('itemController').log('getAllItems 실행!');
    return this.itemRepository.find();
  }

  async createItem(createItemDto: CreateItemDto) {
    return this.itemRepository.createItem(createItemDto);
  }
}
