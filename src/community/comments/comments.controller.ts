import {
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';

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
  @Get('/:boardId')
  getBoardComments(
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<Comment[]> {
    const comments = this.commentsService.getBoardComments(boardId);
    return comments;
  }

  // 댓글 작성
  // @Post('/')
  // createComment(): Promise<string> {
  //   const result = this.commentsService.createComment();
  //   // result : 작성 완료
  //   return result;
  // }

  // 댓글 삭제 : 삭제하지 않고 상태만 변경
  // @Delete('/:commentId')
  // deleteComment(): Promise<string> {
  //   const result = this.commentsService.deleteComment(commentId);
  //   // '삭제 완료'
  //   return result;
  // }

  // 자신이 작성한 댓글 목록 조회
  // User 완료 후 작성
  // @Get('/my')
  // getMyComments(): Promise<Comment[]>{
  //   const comments = this.commentsService.getMyComments(userId);
  //   return comments;
  // }
}
