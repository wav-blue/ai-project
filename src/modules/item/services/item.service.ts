import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  async createItem(createItemDto: CreateItemDto, user: string) {
    return this.itemRepository.createItem(createItemDto, user);
  }

  async deleteItem(id: number, user: string): Promise<void> {
    const result = await this.itemRepository.delete({ id: id, user: user });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find Item with id ${id}`);
    }
  }
}
