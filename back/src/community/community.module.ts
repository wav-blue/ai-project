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
import { LoggerModule } from 'src/logger/logger.module';
import { CommentsCreateService } from './comments/service/comments-create.service';
import { AnonymousNumberReadService } from './comments/service/anonymous-number-read.service';
import { AxiosModule } from 'src/axios/axios.module';
import { PoistionAnalysisService } from './comments/service/position-analysis.service';

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
    PoistionAnalysisService,
    AnonymousNumberReadService,
    BoardsRepository,
    CommentRepository,
    S3Service,
  ],
})
export class CommunityModule {}
