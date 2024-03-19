import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { CreateCommentDto } from '.././dto/create-comment.dto';
import { DataSource } from 'typeorm';
import { Comment } from '.././entity/comments.entity';
import { randomPosition } from '../util/comment.util';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';
import { AxiosRequestService } from './axiosRequest.service';
import { setTimeColumn } from '../util/commentData.util';
import { AnonymousNumberReadService } from './anonymous-number-read.service';
import { BoardsService } from 'src/community/boards/boards.service';

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

  // Comment 작성
  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    let foundBoard: Board;
    let newComment: Comment;

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
      // DTO 값 설정
      createCommentDto = setTimeColumn(createCommentDto);
      const position = await this.axiosRequestPosition(
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

      // 불필요한 컬럼 제거
      newComment = this.deleteColumn(newComment);

      await queryRunnerForCreate.commitTransaction();
    } catch (err) {
      await queryRunnerForCreate.rollbackTransaction();
      throw err;
    } finally {
      await queryRunnerForCreate.release();
    }

    return newComment;
  }

  // 댓글을 생성할 때 postion을 설정
  private async axiosRequestPosition(content: string): Promise<string> {
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

  // 불필요한 Column 제거
  private deleteColumn(comment: Comment): Comment {
    delete comment.updatedAt;
    delete comment.deletedAt;

    return comment;
  }
}
