import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ItemService } from '../services/item.service';
import { Item } from '../entities/item.entity';
import { CreateItemDto } from '../dtos/create-item.dto';

@Controller('item')
export class ItemController {
  private logger = new Logger('itemController');
  constructor(private itemService: ItemService) {}

  @Get('/')
  getAllItem(): Promise<Item[]> {
    this.logger.log(' item get 요청 실행 !');
    return this.itemService.getAllItems();
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  createItem(@Body() createItemDto: CreateItemDto): Promise<Item> {
    this.logger.log(' item post 요청 실행 !');
    return this.itemService.createItem(createItemDto);
  }
}
