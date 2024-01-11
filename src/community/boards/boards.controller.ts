import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  Req,
  Headers,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import { CreateBoardDto } from './dtos/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  getBoardsList(): Promise<Board[]> {
    return this.boardsService.getBoardsList();
  }

  @Post()
  @UsePipes(ValidationPipe)
  createBoard(
    @Headers(),
    @Body() boardDto: CreateBoardDto,
  ): Promise<Board> {
    const user_id: string = request.cookie['userId'];
    return this.boardsService.createBoard(boardDto);
  }

  @Get('/id')
  getBoardById(@Param('id') id: string): Promise<Board> {
    return this.boardsService.getBoardById(id);
  }

  @Delete('/id')
  deleteBoard(@Param('id') id: string): Promise<void> {
    this.boardsService.deleteBoard(id);
  }

  @Put('/id')
  @UsePipes(ValidationPipe)
  updateBoard(
    @Param('id') id: string,
    @Body() boardDto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardsService.updateBoard(id, boardDto);
  }
}
