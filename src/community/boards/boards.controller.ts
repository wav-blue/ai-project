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
  // !!이슈!! board entity랑 user entity 관계설정 하면 잘 되던 쿼리들이 안됨 ㅠㅠ WHY....

  // !!수정!! 검색기능 역인덱스 적용!!
  // !!수정!! 에러처리 필터 거펴가게 하기!!

  // !!개선!! 서비스에서 목록조회 코드들이 중복되는데 똑같은 코드 여러번 쓰지 않고 할 수 있는 방법 생각해보기
  // !!개선!! presigned URL 요청받을때 파일 확장자 이미지인지 먼저 확인하고 이미지 아니면 거절할 수 있는지 알아보기
  // !!개선!! 페이지네이션 할 때 총페이지 수 계산하지 말고 그냥 마지막것만 계산하기 만들거나..redis 사용해보기

  //게시판 리스트 or 키워드 검색 or 태그(카테고리)별 게시물 리스트 or 태그별 검색 게시물 리스트
  @Get()
  async getBoardsList(
    @Query('keyword') keyword: string,
    @Query('tag') tag: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 15;
      }

      if (keyword && tag) {
        //태그별 검색
        const result = await this.boardsService.tagAndSearchBoards(
          tag,
          keyword,
          page,
          limit,
        );
        console.log(result);
        return result;
      } else if (tag) {
        //태그 구분만
        const result = await this.boardsService.tagBoards(tag, page, limit);
        console.log(result);
        return result;
      } else if (keyword) {
        //전체검색
        const result = await this.boardsService.searchBoards(
          keyword,
          page,
          limit,
        );
        console.log(result);
        return result;
      }

      //전체보드 리스트
      const result = await this.boardsService.listBoards(page, limit);
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
    @Query('limit') limit: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const userId = req['user'];
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
