import { Module } from '@nestjs/common';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { BoardRepository } from 'src/boards/board.repository';
import { CommentRepository } from './comments/comments.repository';

@Module({
  controllers: [BoardsController, CommentsController],
  providers: [
    BoardsService,
    CommentsService,
    BoardRepository,
    CommentRepository,
  ],
})
export class CommunityModule {}
