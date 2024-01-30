import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './boards/boards.entity';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { CommentsController } from './comments/comments.controller';
import { BoardsRepository } from './boards/boards.repository';
import { CommentRepository } from './comments/comments.repository';
import { S3Service } from '../common/s3.presigned';
import { HttpModule } from '@nestjs/axios';
import { CommentsReadService } from './comments/service/comments-read.service';
import { CommentsReportService } from './comments/service/comments-report.service';
import { CommentsService } from './comments/service/comments.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController, CommentsController],
  providers: [
    BoardsService,
    CommentsService,
    CommentsReadService,
    CommentsReportService,
    BoardsRepository,
    CommentRepository,
    S3Service,
  ],
})
export class CommunityModule {}
