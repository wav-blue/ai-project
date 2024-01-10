import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ItemService } from '../services/item.service';
import { Item } from '../entities/item.entity';
import { CreateItemDto } from '../dtos/create-item.dto';
import { GetUserTemp } from '../get-user-temp.decorator';
import { UpdateItemDto } from '../dtos/update-item.dto';

@Controller('item')
export class ItemController {
  private logger = new Logger('itemController');
  constructor(private itemService: ItemService) {}

  @Get('/')
  getAllItem(): Promise<Item[]> {
    this.logger.log(' item get 요청 실행 !');
    return this.itemService.getAllItems();
  }

  @Get('/:id')
  getItemById(@Param('id', ParseIntPipe) id: number): Promise<Item> {
    this.logger.log(' item get 요청 실행 !');
    return this.itemService.getItemById(id);
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

  // 일부 리소스 업데이트
  // localhost:5001/item/:id?status=PRIVATE
  //   @Patch('/:id')
  //   updateItemStatus(
  //     @Param('id', ParseIntPipe) id: number,
  //     @GetUserTemp() user: string,
  //     @Query('status') status: string,
  //   ): Promise<Item> {
  //     this.logger.log(' item patch 요청 실행 !');
  //     return this.itemService.updateItemStatus(id, user, status);
  //   }

  // 모든 리소스 업데이트
  //   @Put('/:id')
  //   updateItem(
  //     @Param('id', ParseIntPipe) id: number,
  //     @GetUserTemp() user: string,
  //     @Body() updateItemDto: UpdateItemDto,
  //   ): Promise<Item> {
  //     this.logger.log(' item put 요청 실행 !');
  //     return this.itemService.updateItemContents(updateItemDto, user);
  //   }

  //   @Delete('/:id')
  //   deleteItem(
  //     @Param('id', ParseIntPipe) id: number,
  //     @GetUserTemp() user: string,
  //   ): Promise<void> {
  //     this.logger.log(' item delete 요청 실행 !');
  //     return this.itemService.deleteItem(id, user);
  //   }
}
