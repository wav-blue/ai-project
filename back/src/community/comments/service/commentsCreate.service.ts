import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { CreateCommentDto } from '.././dto/createComment.dto';
import { DataSource } from 'typeorm';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';
import { AnonymousNumberReadService } from './anonymousNumberRead.service';
import { BoardsService } from 'src/community/boards/boards.service';
import { randomPosition } from '../util/comment.util';
import { AxiosRequestService } from 'src/axios/service/axios-request.service';
import { ReadNewCommentDto } from '../dto/readNewComment.dto';

@Injectable()
export class CommentsCreateService {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly axiosRequestService: AxiosRequestService,
    private readonly anonymousNumberReadService: AnonymousNumberReadService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentsCreateService.name);
  }

  // 댓글을 생성할 때 postion을 설정
  private async analysisPosition(content: string): Promise<string> {
    let position: string;
    try {
      // 응답 시간이 길어지는 것을 방지하기 위해 적당한 길이만 분석
      const substring_string = content.substring(0, 36);
      const body = {
        content: substring_string,
      };

      const response = await this.axiosRequestService.FlaskRequest(body);
      position = response.data.position;

      this.logger.verbose(
        `Flask 서버로의 요청 성공! 분석을 통해 position 결정: ${position}`,
      );
    } catch (err) {
      this.logger.warn(`분석 요청이 실패했습니다. Flask 서버를 확인해주세요!`);
      this.logger.verbose(`랜덤으로 position을 결정합니다...`);
      position = randomPosition();
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
      const position = await this.analysisPosition(createCommentDto.content);
      // 익명 번호 anonymousNumber 결정
      const anonymousNumber =
        await this.anonymousNumberReadService.readAnonymousNumber(
          createCommentDto.boardId,
          createCommentDto.userId,
          foundBoard,
          queryRunner,
        );

      // 댓글 데이터 Create
      newComment = await this.commentRepository.createComment(
        createCommentDto,
        position,
        anonymousNumber,
        queryRunner,
      );

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
