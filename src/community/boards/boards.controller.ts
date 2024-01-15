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
  Query,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  //게시판 리스트
  @Get()
  getBoardsList(@Query('page') page: number): Promise<Board[]> {
    return this.boardsService.listBoards(page);
  }

  //검색

  //게시글 읽기

  @Get('/:id')
  getBoardById(@Param('id') boardId: number): Promise<Board | string> {
    const userId = 'user001'; //임시
    return this.boardsService.readBoard(boardId, userId);
  }

  //게시글쓰기
  @Post()
  @UsePipes(ValidationPipe)
  createBoard(@Body() boardDto: CreateBoardDto): Promise<Board> {
    const userId = 'user001'; //임시, Dto 수정 어떻게?
    boardDto.userId = userId;
    return this.boardsService.writeBoard(boardDto);
  }

  //게시글 수정
  @Put('/:id')
  @UsePipes(ValidationPipe)
  updateBoard(
    @Param('id') id: number,
    @Body() boardDto: UpdateBoardDto,
  ): Promise<Board> {
    const userId = 'user001'; //임시
    boardDto.boardId = id; //updateboardDTO 수정 필요..
    return this.boardsService.editBoard(userId, boardDto);
  }

  //게시글 삭제
  @Delete('/:id')
  deleteBoard(@Param('id') id: number): Promise<Board> {
    const userId = 'user001'; //임시
    return this.boardsService.eraseBoard(id, userId);
  }
}
