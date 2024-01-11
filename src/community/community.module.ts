import { Module } from '@nestjs/common';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';

@Module({
  controllers: [BoardsController, CommentsController],
  providers: [BoardsService, CommentsService],
})
export class CommunityModule {}
