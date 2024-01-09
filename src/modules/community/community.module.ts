import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';

@Module({
  controllers: [PostsController, CommentsController],
  providers: [PostsService, CommentsService],
})
export class CommunityModule {}
