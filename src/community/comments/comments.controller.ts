import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { LocalAuthGuard } from 'src/user/guards/local-service.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { Mylogger } from 'src/common/logger/mylogger.service';
import { Comment } from './entity/comments.entity';

import * as dayjs from 'dayjs';

@Controller('comments')
export class CommentsController {
  private logger = new Mylogger(CommentsController.name);
  constructor(private commentsService: CommentsService) {}

  // 테스트용 API
  @Get('logger')
  getLogger(): string {
    this.logger.error('this is error');
    this.logger.warn('this is warn');
    this.logger.log('this is log');
    this.logger.verbose('this is verbose');
    this.logger.debug('this is debug');
    const d = dayjs();
    this.logger.verbose(`현재 설정된 시간 : ${d.format()}`);
    this.logger.verbose(
      `현재 설정된 시간 : ${d.format('YYYY-MM-DD HH:mm:ss')}`,
    );
    return 'success!';
  }

  // 자신이 작성한 댓글 목록 조회
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  getMyComments(
    @GetUser() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{ count: number; list: Comment[] }> {
    // query 값 없을 시 기본 값
    if (!limit) limit = 15;
    if (!page) page = 1;

    this.logger.verbose(`현재 설정된 userId: ${userId}`);
    const comments = this.commentsService.getMyComments(userId, page, limit);
    return comments;
  }

  // 게시글에 작성된 댓글 목록 조회
  @Get('/:boardId')
  async getBoardComments(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    count: number;
    list: Comment[];
    positiveCount: number;
    negativeCount: number;
  }> {
    // query 값 없을 시 기본 값
    if (!limit) limit = 15;
    if (!page) page = 1;

    this.logger.verbose(`${boardId}번 게시글의 댓글 조회!`);

    const comments = await this.commentsService.getBoardComments(
      boardId,
      page,
      limit,
    );
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
    this.logger.log(`댓글 작성 요청!\n현재 설정된 userId: ${userId}`);
    const result = this.commentsService.createComment(userId, createCommentDto);

    return result;
  }

  // 댓글 삭제 : 삭제하지 않고 상태만 변경 status: not_deleted -> deleted
  @UseGuards(LocalAuthGuard)
  @Delete('/:commentId')
  @HttpCode(204)
  deleteComment(
    @GetUser() userId: string,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    this.logger.log(`${commentId}번 댓글 삭제:: 성공 시 응답코드 204`);
    const result = this.commentsService.deleteComment(userId, commentId);
    return result;
  }

  // 신고 내역 추가 (신고 누적 상황에 따라 해당 댓글 삭제)
  @Post('/report')
  @UseGuards(LocalAuthGuard)
  createCommentReport(
    @GetUser() userId: string,
    @Body() createCommentReportDto: CreateCommentReportDto,
  ): Promise<{ status: string }> {
    this.logger.log(
      `${createCommentReportDto.commentId}번 댓글에 대한 신고 접수!`,
    );

    createCommentReportDto.reportUserId = userId;

    const result = this.commentsService.createCommentReport(
      createCommentReportDto,
      userId,
    );
    return result;
  }

  // 댓글 좋아요 기능
  @Post('/:commentId/like')
  @UseGuards(LocalAuthGuard)
  updateCommentLike(
    @GetUser() userId: string,
    @Body() createCommentReportDto: CreateCommentReportDto,
  ): Promise<{ status: string }> {
    this.logger.log(
      `${createCommentReportDto.commentId}번 댓글에 대한 신고 접수!`,
    );

    const result = this.commentsService.createCommentReport(
      createCommentReportDto,
      userId,
    );
    return result;
  }
}
