import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { CreateCommentDto } from '.././dto/createComment.dto';
import { DataSource } from 'typeorm';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';
import { BoardsService } from 'src/community/boards/boards.service';
import { AxiosRequestService } from 'src/axios/service/axios-request.service';
import { ReadNewCommentDto } from '../dto/readNewComment.dto';
import { FindAnonymousNumberService } from './findAnonymousNumber.service';
import { CommentPosition } from '../enum/commentPosition.enum';
import { AnalysisService } from 'src/community/analysis.service';

@Injectable()
export class CreateCommentService {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly findAnonymousNumberService: FindAnonymousNumberService,
    private readonly analysisService: AnalysisService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CreateCommentService.name);
  }

  // 댓글을 생성할 때 postion을 설정
  private async analysisRequest(content: string): Promise<CommentPosition> {
    let position: CommentPosition;
    try {
      this.logger.verbose('job add!!');
      this.analysisService.addJob(content);
      this.logger.verbose('job add 완료');
      position = CommentPosition.LOADING;
    } catch (err) {
      this.logger.error(`작업 요청에 실패했습니다.`);
      position = CommentPosition.LOADING;
    }
    return position;
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

    try {
      // 해당 게시글 조회
      foundBoard = await this.boardsService.readBoard(createCommentDto.boardId);

      // 댓글 내용 기반으로 Position 결정
      const position = await this.analysisRequest(createCommentDto.content);

      // 익명 번호 anonymousNumber 결정
      const anonymousNumber =
        await this.findAnonymousNumberService.readAnonymousNumber(
          createCommentDto.boardId,
          createCommentDto.userId,
          foundBoard,
          queryRunner,
        );
      this.logger.verbose('익명 번호 결정');

      // 댓글 데이터 Create
      newComment = await this.commentRepository.createComment(
        createCommentDto,
        position,
        anonymousNumber,
        queryRunner,
      );
      this.logger.verbose('댓글 데이터 Create 완료');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return newComment;
  }
}
