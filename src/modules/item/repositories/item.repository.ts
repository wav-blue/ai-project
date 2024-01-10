import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto } from '../dtos/create-item.dto';

@Injectable()
export class ItemRepository extends Repository<Item> {
  constructor(dataSource: DataSource) {
    super(Item, dataSource.createEntityManager());
  }
  async createItem(createItemDto: CreateItemDto, user: string): Promise<Item> {
    const { title, description } = createItemDto;

    const item = this.create({
      title,
      description,
      status: 'PUBLIC',
      user,
    });

    await this.save(item);
    return item;
  }
}
