import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './boards/boards.entity';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { CommentsController } from './comments/comments.controller';
import { BoardsRepository } from './boards/boards.repository';
import { CommentRepository } from './comments/repository/comments.repository';
import { S3Service } from '../common/s3.presigned';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';
import { AxiosModule } from 'src/axios/axios.module';
import { CreateCommentService } from './comments/service/createComment.service';
import { FindAnonymousNumberService } from './comments/service/findAnonymousNumber.service';
import { DeleteCommentService } from './comments/service/deleteComment.service';
import { FindCommentsByBoardIdService } from './comments/service/findCommentsByBoardId.service';
import { CreateReportWithCommentService } from './comments/service/createReportWithComment.service';
import { FindCommentService } from './comments/service/findComment.service';
import { FindCommentsByUserIdService } from './comments/service/findCommentsByUserId.service';
import { CountCommentsByBoardIdService } from './comments/service/countCommentsByBoardId.service';
import { DeleteCommentReportedService } from './comments/service/deleteCommentReported.service';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisConsumer } from './analysis.consumer';
import { AnalysisService } from './analysis.service';
import { UpdateCommentService } from './comments/service/updateComment.service';
import { CommentReportRepository } from './comments/repository/commentReport.repository';

@Module({
  imports: [
    // BullMQ
    BullModule.registerQueue({
      name: 'analysis',
    }),
    HttpModule,
    TypeOrmModule.forFeature([Board]),
    LoggerModule,
    AxiosModule,
  ],
  controllers: [BoardsController, CommentsController],
  providers: [
    BoardsService,
    CreateCommentService,
    DeleteCommentService,
    FindCommentsByBoardIdService,
    FindCommentsByUserIdService,
    FindCommentService,
    FindAnonymousNumberService,
    CountCommentsByBoardIdService,
    CommentReportRepository,
    CreateReportWithCommentService,
    DeleteCommentReportedService,
    UpdateCommentService,
    BoardsRepository,
    CommentRepository,
    S3Service,
    AnalysisConsumer,
    AnalysisService,
  ],
})
export class CommunityModule {}
