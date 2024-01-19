import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../user/guards/local-service.guard';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  // !! 수정!! boards 만 들어가면 무조건 page=1 로 가게 하기!
  // !! 실험!! Dto 에서 user_id not empty 걸어도 작동하는지 실험해보기

  //게시판 리스트 or 키워드 검색 or 태그(카테고리)별 게시물 리스트 or 태그별 검색 게시물 리스트
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
  @UseGuards(LocalAuthGuard)
  async getUserBoards(
    @Request() req: Request,
    @Query('page') page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const userId = req['user'];
    try {
      const result = await this.boardsService.listUserBoards(userId, page);
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //게시글 이미지 업로드용 presigned URL 요청
  @Get('/images')
  @UseGuards(LocalAuthGuard)
  async getBoardImgsUrl(
    @Request() req: Request,
    @Body('files') files: string[],
  ): Promise<string[]> {
    const userId = req['user'];
    try {
      const result = await this.boardsService.getPreSignedUrl(userId, files);
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
  @Post()
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async createBoard(
    @Request() req: Request,
    @Body() boardDto: CreateBoardDto,
  ): Promise<{ boardId: number; message: string }> {
    const userId = req['user'];
    boardDto.userId = userId;
    console.log('dto:', boardDto);
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
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async updateBoard(
    @Request() req: Request,
    @Body() boardDto: UpdateBoardDto,
  ): Promise<{ message: string }> {
    const userId = req['user'];
    boardDto.userId = userId;
    try {
      await this.boardsService.editBoard(boardDto);
      return { message: '수정 성공' };
    } catch (err) {
      throw err;
    }
  }

  //게시글 삭제
  @Delete()
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async deleteBoard(
    @Request() req: Request,
    @Body('boardId') boardId: number,
  ): Promise<{ message: string }> {
    const userId = req['user'];
    try {
      await this.boardsService.eraseBoard(userId, boardId);
      return { message: '삭제 성공' };
    } catch (err) {
      throw err;
    }
  }
}
