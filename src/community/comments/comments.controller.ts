import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { LocalAuthGuard } from 'src/user/guards/local-service.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('comments')
export class CommentsController {
  private logger = new Logger('commentsController');
  constructor(private commentsService: CommentsService) {}

  // 자신이 작성한 댓글 목록 조회
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  getMyComments(
    @GetUser() userId: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<Comment[]> {
    const comments = this.commentsService.getMyComments(userId, page);
    return comments;
  }

  // 게시글에 작성된 댓글 목록 조회
  // 페이지네이션 나중에 적용
  @Get('/:boardId')
  async getBoardComments(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() page: number,
  ): Promise<Comment[]> {
    const comments = await this.commentsService.getBoardComments(boardId, page);
    return comments;
  }

  // 테스트용 전체 조회
  @Get('/')
  getAllComments(): Promise<Comment[]> {
    this.logger.log(`get 요청 받아짐`);
    return this.commentsService.getAllComments();
  }

  //댓글 작성
  @Post('/')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  createComment(
    @GetUser() userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const result = this.commentsService.createComment(userId, createCommentDto);
    // result : 작성 완료
    return result;
  }

  // 댓글 삭제 : 삭제하지 않고 상태만 변경 status: not_deleted -> deleted
  @Delete('/:commentId')
  deleteComment(
    @GetUser() userId: string,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    const result = this.commentsService.deleteComment(userId, commentId);
    // '삭제 완료'
    return result;
  }

  // 신고 내역 추가 (신고 누적 상황에 따라 해당 댓글 삭제)
  @Post('/report')
  createCommentReport(
    @GetUser() userId: string,
    @Body() createCommentReportDto: CreateCommentReportDto,
  ) {
    const result = this.commentsService.createCommentReport(
      createCommentReportDto,
      userId,
    );
    return result;
  }
}
