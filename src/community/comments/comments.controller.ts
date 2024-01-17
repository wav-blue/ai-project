import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { GetUserTemp } from './get-user-temp.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';

@Controller('comments')
export class CommentsController {
  private logger = new Logger('commentsController');
  constructor(private commentsService: CommentsService) {}

  @Get('/')
  getAllComments(): Promise<Comment[]> {
    this.logger.log(`get 요청 받아짐`);
    return this.commentsService.getAllComments();
  }

  // 게시글에 작성된 댓글 목록 조회
  // 페이지네이션 나중에 적용
  @Get('/:boardId')
  async getBoardComments(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() page: number,
  ): Promise<Comment[]> {
    console.log(page);
    const comments = await this.commentsService.getBoardComments(boardId, page);
    console.log('Get result : ');
    console.log(comments);
    return comments;
  }

  //댓글 작성
  @Post('/')
  @UsePipes(ValidationPipe)
  createComment(
    @GetUserTemp() user: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const result = this.commentsService.createComment(user, createCommentDto);
    // result : 작성 완료
    console.log('Post result : ');
    console.log(result);
    return result;
  }

  // 댓글 삭제 : 삭제하지 않고 상태만 변경 status: not_deleted -> deleted
  @Delete('/:commentId')
  deleteComment(
    @GetUserTemp() user: string,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    const result = this.commentsService.deleteComment(user, commentId);
    // '삭제 완료'
    return result;
  }

  // 신고 내역 추가 (신고 누적 상황에 따라 해당 댓글 삭제)
  @Post('/report')
  createCommentReport(@Body() createCommentReportDto: CreateCommentReportDto) {
    const result = this.commentsService.createCommentReport(
      createCommentReportDto,
    );
    return result;
  }

  // 자신이 작성한 댓글 목록 조회
  // User 완료 후 작성
  // @Get('/my')
  // getMyComments(): Promise<Comment[]>{
  //   const comments = this.commentsService.getMyComments(userId);
  //   return comments;
  // }
}
