import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { CreateCommentDto } from '.././dto/create-comment.dto';
import { DataSource } from 'typeorm';
import { randomPosition } from '../util/comment.util';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';
import { AnonymousNumberReadService } from './anonymous-number-read.service';
import { BoardsService } from 'src/community/boards/boards.service';
import { ReadNewCommentDto } from '../dto/read-new-comment.dto';
import { PoistionAnalysisService } from './position-analysis.service';

@Injectable()
export class CommentsCreateService {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly poistionAnalysisService: PoistionAnalysisService,
    private readonly anonymousNumberReadService: AnonymousNumberReadService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentsCreateService.name);
  }

  // Comment 작성
  async createComment(
    createCommentDto: CreateCommentDto,
  ): Promise<ReadNewCommentDto> {
    let foundBoard: Board;
    let newComment: ReadNewCommentDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    // 해당 게시글의 정보 조회
    try {
      foundBoard = await this.boardsService.readBoard(createCommentDto.boardId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // 게시글에 댓글 생성
    const queryRunnerForCreate = this.dataSource.createQueryRunner();
    await queryRunnerForCreate.connect();

    await queryRunnerForCreate.startTransaction();

    try {
      const position = await this.poistionAnalysisService.analysisPosition(
        createCommentDto.content,
      );
      const anonymousNumber =
        await this.anonymousNumberReadService.readAnonymousNumber(
          createCommentDto.boardId,
          createCommentDto.userId,
          foundBoard,
          queryRunnerForCreate,
        );

      // 댓글 테이블 Create
      newComment = await this.commentRepository.createComment(
        createCommentDto,
        position,
        anonymousNumber,
        queryRunnerForCreate,
      );

      await queryRunnerForCreate.commitTransaction();
    } catch (err) {
      await queryRunnerForCreate.rollbackTransaction();
      throw err;
    } finally {
      await queryRunnerForCreate.release();
    }

    return newComment;
  }
}
