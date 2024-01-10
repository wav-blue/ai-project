import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto } from '../dtos/create-item.dto';
import { UpdateItemDto } from '../dtos/update-item.dto';
// import { UpdateItemDto } from '../dtos/update-item.dto';

@Injectable()
// extends Repository<Item> 삭제됨
export class ItemRepository {
  // 원래는 createEntityManager를 이용했지만 수정됨
  // constructor(dataSource: DataSource) {
  //   super(Item, dataSource.createEntityManager());
  // }
  private itemRepository: Repository<Item>;

  constructor(private readonly dataSource: DataSource) {
    this.itemRepository = this.dataSource.getRepository(Item);
  }
  async getItemAll(): Promise<Item[]> {
    const found = this.itemRepository
      .createQueryBuilder()
      .select('item')
      .from(Item, 'item')
      .getMany();

    // getMany() 사용이 맞는지 확실하지 않음!

    //const found = this.dataSource.manager.find(Item);

    return found;
  }

  async getItemById(id: number): Promise<Item> {
    // await를 안붙여도 작동하는 것 같음
    // 1. DataSource 사용
    new Logger('itemRepository').log('DataSource 방식 실행', id);
    const found = await this.itemRepository
      .createQueryBuilder()
      .select('item')
      .from(Item, 'item')
      .where('item.id = :id', { id })
      .getOne();

    // 2. entity manager 사용
    // new Logger('itemRepository').log('entity manager 방식 실행', id);
    // const found = await this.itemRepository.manager
    //   .createQueryBuilder(Item, 'item')
    //   .where('item.id = :id', { id })
    //   .getOne();

    return found;
  }

  async createItem(createItemDto: CreateItemDto, user: string): Promise<Item> {
    const { title, description } = createItemDto;

    // 이것도 되는 코드
    // const newItem = this.itemRepository.create({
    //   title,
    //   description,
    //   status: 'PUBLIC',
    //   user,
    // });
    //await this.itemRepository.save(newItem);

    const newItemResults = await this.itemRepository
      .createQueryBuilder()
      .insert()
      .into(Item)
      .values({
        title,
        description,
        status: 'PUBLIC',
        user,
      })
      .execute();

    const newItem = this.getItemById(newItemResults.identifiers[0].id);
    return newItem;
  }
  async updateItemStatus(
    id: number,
    user: string,
    status: string,
  ): Promise<Item> {
    const updateItemResults = await this.itemRepository
      .createQueryBuilder()
      .update(Item)
      .set({
        status,
      })
      .where('id = :id', { id })
      .execute();
    console.log(updateItemResults);
    const updatedItem = this.getItemById(id);
    return updatedItem;
  }
  // 전체적인 수정
  async updateItem(
    updateItemDto: UpdateItemDto,
    id: number,
    user: string,
  ): Promise<Item> {
    const { title, description } = updateItemDto;

    const updateItemResults = await this.itemRepository
      .createQueryBuilder()
      .update(Item)
      .set({
        title,
        description,
      })
      .where('id = :id', { id })
      .execute();
    console.log(updateItemResults);
    const updatedItem = this.getItemById(id);
    return updatedItem;
  }

  async deleteItem({ id, user }) {
    const result = await this.itemRepository
      .createQueryBuilder()
      .delete()
      .from(Item)
      .where('id = :id', { id })
      .execute();

    return result;
  }
}
