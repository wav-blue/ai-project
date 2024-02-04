import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { CreateCommentDto } from '.././dto/create-comment.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { CommentStatus } from '.././enum/CommentStatus.enum';
import { AnonymousNumberType } from '.././enum/AnonymousNumberType.enum';
import { Comment } from '.././entity/comments.entity';
import { CommentPosition } from '.././enum/CommentPosition.enum';
import { randomPosition } from '../util/comment.util';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';
import { AxiosRequestService } from './axiosRequest.service';
import { setTimeColumn } from '../util/commentData.util';

@Injectable()
export class CommentsCreateService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly axiosRequestService: AxiosRequestService,
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
      foundBoard = await this.getBoard(createCommentDto, queryRunner);
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
      createCommentDto = await this.setPosition(createCommentDto);
      createCommentDto = await this.setAnonymousNumber(
        createCommentDto,
        foundBoard,
        queryRunnerForCreate,
      );

      // 댓글 카운팅 테이블 Update
      this.calCommentCount(createCommentDto, queryRunnerForCreate);

      // 댓글 테이블 Create
      newComment = await this.commentRepository.createComment(
        createCommentDto,
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
  private async setPosition(
    createCommentDto: CreateCommentDto,
  ): Promise<CreateCommentDto> {
    try {
      // 응답 시간이 길어지는 것을 방지하기 위해 적당한 길이만 분석
      const substring_string = createCommentDto.content.substring(0, 36);
      const body = {
        content: substring_string,
      };

      const response = await this.axiosRequestService.FlaskRequest(body);
      const { position } = response.data;
      createCommentDto.position = position;

      this.logger.verbose(
        `Flask 서버로의 요청 성공! 분석을 통해 position 결정: ${position}`,
      );
    } catch (err) {
      this.logger.warn(`분석 요청이 실패했습니다. Flask 서버를 확인해주세요!`);
      this.logger.verbose(`랜덤으로 position을 결정합니다...`);
      const position = randomPosition();
      createCommentDto.position = position;
    }

    return createCommentDto;
  }

  // 불필요한 Column 제거
  private deleteColumn(comment: Comment): Comment {
    delete comment.updatedAt;
    delete comment.deletedAt;

    return comment;
  }

  private async getBoard(
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ): Promise<Board> {
    const { boardId } = createCommentDto;

    // 게시글 정보 조회
    const foundBoard = await this.commentRepository.checkBoard(
      boardId,
      queryRunner,
    );
    const boardStatus = foundBoard?.status;

    if (!foundBoard || boardStatus !== CommentStatus.NOT_DELETED) {
      if (foundBoard)
        this.logger.warn(
          `게시글 상태가 ${boardStatus}인 데이터의 조회 요청 들어옴`,
        );
      throw new NotFoundException('해당하는 게시글이 없습니다.');
    }

    return foundBoard;
  }

  // 익명 번호를 설정
  private async setAnonymousNumber(
    createCommentDto: CreateCommentDto,
    foundBoard: Board,
    queryRunner: QueryRunner,
  ): Promise<CreateCommentDto> {
    const { userId } = createCommentDto;
    const boardWriter = foundBoard.userId;

    // 게시글 작성자: 특수한 익명 번호 부여(0)
    if (userId === boardWriter) {
      createCommentDto.anonymous_number = AnonymousNumberType.WRITER;
      this.logger.debug(
        `게시글 작성자가 댓글 작성함 : 익명번호 ${AnonymousNumberType.WRITER}`,
      );
      return createCommentDto;
    }

    // 일반 작성자
    const existingAnonymousNumber =
      await this.commentRepository.getAnonymousNumber(
        createCommentDto,
        queryRunner,
      );
    if (existingAnonymousNumber) {
      createCommentDto.anonymous_number = existingAnonymousNumber;
      this.logger.debug(
        `기존의 익명 번호가 존재함 : ${existingAnonymousNumber}`,
      );
    } else {
      let newAnonymousNumber =
        await this.commentRepository.getNewAnonymousNumber(
          createCommentDto,
          queryRunner,
        );

      // 조회된 내역 없음
      if (!newAnonymousNumber) newAnonymousNumber = 0;

      createCommentDto.anonymous_number = newAnonymousNumber + 1;
      this.logger.debug(
        `새로 익명 번호가 부여됨 : ${createCommentDto.anonymous_number}`,
      );
    }

    return createCommentDto;
  }

  private async calCommentCount(
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ): Promise<string> {
    const { boardId, position } = createCommentDto;
    // 해당 댓글의 카운팅 데이터
    const foundCountPosition = await this.commentRepository.checkCommentCount(
      boardId,
      queryRunner,
    );

    // 없으면 생성: 첫번째 댓글
    if (!foundCountPosition) {
      await this.commentRepository.createCommentCount(boardId, queryRunner);
    }

    this.logger.debug(`댓글이 생성되어 ${position}Count 증가`);

    if (position === CommentPosition.POSITIVE)
      foundCountPosition.positiveCount += 1;
    if (position === CommentPosition.NEGATIVE)
      foundCountPosition.negativeCount += 1;
    await this.commentRepository.updateCommentCount(
      boardId,
      foundCountPosition,
      queryRunner,
    );

    return 'success';
  }
}
