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
  async getBoardsList(@Query('page') page: number): Promise<Board[]> {
    const result = await this.boardsService.listBoards(page);
    console.log(result);
    return result;
  }

  //검색 //검색어 쿼리파람으로?
  //검색자 사용해서 "이거, 저거" 이렇게 검색할 수 있게 나중에 수정...
  @Get()
  async getSearchedList(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
  ): Promise<Board[]> {
    const result = await this.boardsService.searchBoards(keyword, page);
    console.log(result);
    return result;
  }

  //유저보드
  @Get()
  async getUserBoards(@Query('page') page: number): Promise<Board[]> {
    const userId = 'user008'; //임시
    const result = await this.boardsService.listUserBoards(userId, page);
    console.log(result);
    return result;
  }
  //게시글 읽기

  @Get('/:id')
  getBoardById(@Param('id') boardId: number): Promise<Board> {
    const userId = 'user008'; //임시
    return this.boardsService.readBoard(boardId, userId);
  }

  //게시글쓰기
  //생성일자 자동으로 안되는 문제 발생중
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
    const userId = 'user002'; //임시
    boardDto.boardId = id; //updateboardDTO 수정 필요..
    return this.boardsService.editBoard(userId, boardDto);
  }

  //게시글 삭제
  @Delete('/:id')
  deleteBoard(@Param('id') id: number): Promise<Board> {
    const userId = 'user003'; //임시
    return this.boardsService.eraseBoard(id, userId);
  }
}
