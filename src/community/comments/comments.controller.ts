import { Controller, Get, Logger } from '@nestjs/common';
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
}
