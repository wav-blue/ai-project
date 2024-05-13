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
import { CommentsReadService } from './comments/service/commentsRead.service';
import { CommentsReportService } from './comments/service/commentsReport.service';
import { CommentsService } from './comments/service/comments.service';
import { LoggerModule } from 'src/logger/logger.module';
import { CommentsCreateService } from './comments/service/commentsCreate.service';
import { AnonymousNumberReadService } from './comments/service/anonymousNumberRead.service';
import { AxiosModule } from 'src/axios/axios.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Board]),
    LoggerModule,
    AxiosModule,
  ],
  controllers: [BoardsController, CommentsController],
  providers: [
    BoardsService,
    CommentsService,
    CommentsCreateService,
    CommentsReadService,
    CommentsReportService,
    AnonymousNumberReadService,
    BoardsRepository,
    CommentRepository,
    S3Service,
  ],
})
export class CommunityModule {}
