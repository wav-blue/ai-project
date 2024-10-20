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
import { CreateCommentDto } from './dto/createComment.dto';
import { LocalAuthGuard } from 'src/user/guards/local-service.guard';

import { GetUser } from 'src/common/decorator/get-user.decorator';
import { MyLogger } from 'src/logger/logger.service';
import { QueryPageDto } from './dto/queryPage.dto';
import { CreateCommentService } from './service/createComment.service';
import { FindCommentsByBoardIdService } from './service/findCommentsByBoardId.service';
import { DeleteCommentService } from './service/deleteComment.service';
import { FindCommentsByUserIdService } from './service/findCommentsByUserId.service';
import { ReadCommentsByBoardIdDto } from './dto/readCommentsByBoardId.dto';
import { ReadCommentsByUserIdDto } from './dto/readCommentsByUserId.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private createCommentService: CreateCommentService,
    private deleteCommentService: DeleteCommentService,
    private findCommentsByUserIdService: FindCommentsByUserIdService,
    private findCommentsByBoardIdService: FindCommentsByBoardIdService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentsController.name);
  }

  // 자신이 작성한 댓글 목록 조회
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  getMyComments(
    @GetUser() userId: string,
    @Query() queryPageDto: QueryPageDto,
  ): Promise<ReadCommentsByUserIdDto> {
    const comments = this.findCommentsByUserIdService.getCommentsByUserId(
      userId,
      queryPageDto,
    );
    return comments;
  }

  // 게시글에 작성된 댓글 목록 조회
  @Get('/:boardId')
  async getBoardComments(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() queryPageDto: QueryPageDto,
  ): Promise<ReadCommentsByBoardIdDto> {
    const comments =
      await this.findCommentsByBoardIdService.getCommentsByBoardId(
        boardId,
        queryPageDto,
      );
    return comments;
  }

  //댓글 작성
  @Post('/')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  createComment(
    @GetUser() userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    createCommentDto.userId = userId;

    const result = this.createCommentService.createComment(createCommentDto);

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
    this.logger.debug(`${commentId}번 댓글 삭제`);
    const result = this.deleteCommentService.deleteComment(userId, commentId);
    return result;
  }
}
