import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ItemService } from '../services/item.service';
import { Item } from '../entities/item.entity';
import { CreateItemDto } from '../dtos/create-item.dto';
import { GetUserTemp } from '../get-user-temp.decorator';

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
  createItem(
    @Body() createItemDto: CreateItemDto,
    @GetUserTemp() user: string,
  ): Promise<Item> {
    this.logger.log(' item post 요청 실행 !');
    return this.itemService.createItem(createItemDto, user);
  }

  @Delete('/:id')
  deleteBoard(
    @Param('id', ParseIntPipe) id: number,
    @GetUserTemp() user: string,
  ): Promise<void> {
    this.logger.log(' item delete 요청 실행 !');
    return this.itemService.deleteItem(id, user);
  }
}
