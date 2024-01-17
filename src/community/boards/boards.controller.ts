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
  // !!!!게시글 태그 넣기!!!
  //검색?(태그 검색)

  //게시판 리스트 or 키워드 검색 or 태그(카테고리) 별 게시물 리스트
  //태그 + 검색일경우 태그로 먼저 거르고 + 조인해서 검색?
  @Get()
  async getBoardsList(
    @Query('keyword') keyword: string,
    @Query('tag') tag: string,
    @Query('page') page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    try {
      if (keyword && tag) {
        //태그별 검색
        const result = await this.boardsService.tagAndSearchBoards(
          tag,
          keyword,
          page,
        );
        console.log(result);
        return result;
      } else if (tag) {
        //태그 구분만
        const result = await this.boardsService.tagBoards(tag, page);
        console.log(result);
        return result;
      } else if (keyword) {
        //전체검색
        const result = await this.boardsService.searchBoards(keyword, page);
        console.log(result);
        return result;
      }
      //전체보드 리스트
      const result = await this.boardsService.listBoards(page);
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //유저보드
  @Get('/my')
  async getUserBoards(
    @Query('page') page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const userId = 'user002'; //임시
    try {
      const result = await this.boardsService.listUserBoards(userId, page);
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //게시글 읽기
  @Get('/:boardId')
  async getBoardById(@Param('boardId') boardId: number): Promise<Board> {
    try {
      const result = await this.boardsService.readBoard(boardId);
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //게시글쓰기
  //생성일자 자동으로 안되는 문제 발생중
  @Post()
  @UsePipes(ValidationPipe)
  async createBoard(
    @Body() boardDto: CreateBoardDto,
  ): Promise<{ boardId: number; message: string }> {
    const userId = 'user001'; //임시, Dto 수정 어떻게?
    boardDto.userId = userId;
    try {
      const result = await this.boardsService.writeBoard(boardDto);
      console.log(result);
      return { boardId: result.boardId, message: '글 작성 성공' };
    } catch (err) {
      throw err;
    }
  }

  //게시글 수정
  @Put()
  @UsePipes(ValidationPipe)
  async updateBoard(
    @Body() boardDto: UpdateBoardDto,
  ): Promise<{ message: string }> {
    const userId = 'user001'; //임시
    try {
      await this.boardsService.editBoard(userId, boardDto);
      return { message: '수정 성공' };
    } catch (err) {
      throw err;
    }
  }

  //게시글 삭제
  @Delete()
  async deleteBoard(
    @Body('boardId') boardId: number,
  ): Promise<{ message: string }> {
    const userId = 'user003'; //임시
    try {
      await this.boardsService.eraseBoard(userId, boardId);
      return { message: '삭제 성공' };
    } catch (err) {
      throw err;
    }
  }
}
