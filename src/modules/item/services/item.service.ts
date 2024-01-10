import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Item } from '../entities/item.entity';
import { ItemRepository } from '../repositories/item.repository';
import { CreateItemDto } from '../dtos/create-item.dto';
import { UpdateItemDto } from '../dtos/update-item.dto';

@Injectable()
export class ItemService {
  //constructor(private itemRepository: ItemRepository) {}
  constructor(private readonly itemRepository: ItemRepository) {}

  async getAllItems(): Promise<Item[]> {
    new Logger('itemController').log('getAllItems 실행!');
    return this.itemRepository.getItemAll();
  }

  async getItemById(id: number): Promise<Item> {
    const found = await this.itemRepository.getItemById(id);

    if (!found) {
      throw new NotFoundException(`Can't find Item with id ${id}`);
    }

    return found;
  }

  async createItem(createItemDto: CreateItemDto, user: string) {
    return this.itemRepository.createItem(createItemDto, user);
  }

  async updateItemStatus(
    id: number,
    user: string,
    status: string,
  ): Promise<Item> {
    const updateItem = await this.itemRepository.updateItemStatus(
      id,
      user,
      status,
    );

    return updateItem;
  }

  async updateItemContents(
    updateItemDto: UpdateItemDto,
    id: number,
    user: string,
  ): Promise<Item> {
    const updateItem = await this.itemRepository.updateItem(
      updateItemDto,
      id,
      user,
    );
    return updateItem;
  }

  async deleteItem(id: number, user: string): Promise<void> {
    const result = await this.itemRepository.deleteItem({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find Item with id ${id}`);
    }
  }
}
