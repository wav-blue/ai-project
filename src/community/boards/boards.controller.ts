import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../user/guards/local-service.guard';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import {
  BoardsListQueryDto,
  CreateBoardDto,
  CreateBoardReportDto,
  UpdateBoardDto,
} from './boards.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  // !! 커스텀 에러, 페이지네이션 수정 필요

  //게시판 리스트 or 키워드 검색 or 태그(카테고리)별 게시물 리스트 or 태그별 검색 게시물 리스트
  @Get()
  async getBoardsList(
    @Query() query: BoardsListQueryDto,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    try {
      //서비스에서 검색, 리스팅 분기
      const result = await this.boardsService.listBoards(query);
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
    @GetUser() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 15;
    }
    try {
      const result = await this.boardsService.listUserBoards(
        userId,
        page,
        limit,
      );
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //게시글 이미지 업로드용 presigned URL 요청
  @Put('/images')
  @UseGuards(LocalAuthGuard)
  async getBoardImgsUrl(
    @GetUser() userId: string,
    @Body('files') files: string[],
  ): Promise<string[]> {
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
    @GetUser() userId: string,
    @Body() boardDto: CreateBoardDto,
  ): Promise<{ boardId: number; message: string }> {
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
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async updateBoard(
    @GetUser() userId: string,
    @Body() boardDto: UpdateBoardDto,
  ): Promise<{ message: string }> {
    boardDto.userId = userId;
    try {
      await this.boardsService.editBoard(boardDto);
      return { message: '수정 성공' };
    } catch (err) {
      throw err;
    }
  }

  //게시글 삭제
  @Delete('/:boardId')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async deleteBoard(
    @GetUser() userId: string,
    @Param('boardId') boardId: number,
  ): Promise<{ message: string }> {
    try {
      await this.boardsService.eraseBoard(userId, boardId);
      return { message: '삭제 성공' };
    } catch (err) {
      throw err;
    }
  }

  // 신고 내역 추가 (신고 누적 상황에 따라 해당 댓글 삭제)
  @Post('/report')
  @UseGuards(LocalAuthGuard)
  createBoardReport(
    @GetUser() userId: string,
    @Body() createBoardReportDto: CreateBoardReportDto,
  ): Promise<{ status: string }> {
    try {
      const result = this.boardsService.createBoardReport(
        userId,
        createBoardReportDto,
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
}
