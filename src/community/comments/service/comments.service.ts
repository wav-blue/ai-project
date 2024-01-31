import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { CreateCommentDto } from '.././dto/create-comment.dto';
import { DataSource } from 'typeorm';
import { CommentStatus } from '.././enum/CommentStatus.enum';
import { AnonymousNumberType } from '.././enum/AnonymousNumberType.enum';
import { Comment } from '.././entity/comments.entity';
import { CommentPosition } from '.././enum/CommentPosition.enum';
import * as dayjs from 'dayjs';
import { AxiosRequest } from '../util/axiosRequest.util';
import { randomPosition } from '../util/comment.util';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';

@Injectable()
export class CommentsService {
  // private readonly logger = new MyLogger(CommentsService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly axiosRequest: AxiosRequest,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentsService.name);
  }

  // DTO의 날짜 관련 컬럼을 설정
  private setTimeOfCreateDto(dto: any) {
    const day = dayjs();

    dto.createdAt = day.format();
    dto.updatedAt = day.format();
    dto.deletedAt = null;

    return dto;
  }

  private checkAffectedDB(queryAffected: number) {
    if (queryAffected === 0) {
      this.logger.error('DB에서 업데이트 된 내용이 존재하지 않습니다.');
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 요청을 완료하지 못했습니다.',
      );
    }
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

      const response = await this.axiosRequest.FlaskAxios(body); // 분석된 결과를 DTO에 추가
      this.logger.verbose(
        `Flask 서버로의 요청 성공! 분석을 통해 position 결정: ${response.data.position}`,
      );
      createCommentDto.position = response.data.position;
    } catch (err) {
      this.logger.warn(`분석 요청이 실패했습니다. Flask 서버를 확인해주세요!`);
      const position = randomPosition();
      this.logger.verbose(`랜덤으로 position을 결정합니다... ${position}`);
      createCommentDto.position = position;
    }

    return createCommentDto;
  }

  // Comment 작성
  async createComment(
    user: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    // DTO의 createdAt, updatedAt, deletedAt 설정
    createCommentDto = this.setTimeOfCreateDto(createCommentDto);

    // Flask 서버로 요청하여 DTO의 position 설정
    createCommentDto = await this.setPosition(createCommentDto);

    const queryRunnerForGet = this.dataSource.createQueryRunner();
    await queryRunnerForGet.connect();

    // 생성된 댓글의 정보를 저장
    let createResult: Comment;
    const { boardId, position } = createCommentDto;
    await queryRunnerForGet.startTransaction();

    let foundBoard: Board;

    try {
      // 게시글 정보 조회
      foundBoard = await this.commentRepository.checkBoard(
        boardId,
        queryRunnerForGet,
      );
      const boardStatus = foundBoard?.status;

      if (!foundBoard || boardStatus !== CommentStatus.NOT_DELETED) {
        this.logger.error('해당 게시글을 조회할 수 없음');
        if (foundBoard) this.logger.error(`게시글의 상태: ${boardStatus}`);
        throw new NotFoundException('해당하는 게시글이 없습니다.');
      }

      // 익명 번호를 부여
      // 게시글 작성자: 특수한 익명 번호 부여(0)
      const boardWriter = foundBoard.userId;
      if (user === boardWriter) {
        createCommentDto.anonymous_number = AnonymousNumberType.WRITER;
        this.logger.verbose(
          `게시글 작성자가 댓글 작성함 : 익명번호 ${AnonymousNumberType.WRITER}`,
        );
      } else {
        // 일반 작성자
        const existingAnonymousNumber =
          await this.commentRepository.getAnonymousNumber(
            user,
            createCommentDto,
            queryRunnerForGet,
          );
        if (existingAnonymousNumber) {
          createCommentDto.anonymous_number = existingAnonymousNumber;
          this.logger.verbose(
            `기존의 익명 번호가 존재함 : ${existingAnonymousNumber}`,
          );
        } else {
          let new_anonymous_number =
            await this.commentRepository.getNewAnonymousNumber(
              createCommentDto,
              queryRunnerForGet,
            );
          if (!new_anonymous_number) new_anonymous_number = 0;

          createCommentDto.anonymous_number = new_anonymous_number + 1;
          this.logger.verbose(
            `새로 익명 번호가 부여됨 : ${new_anonymous_number + 1}`,
          );
        }
      }
    } catch (err) {
      await queryRunnerForGet.rollbackTransaction();
    } finally {
      await queryRunnerForGet.release();
    }

    // 댓글 카운팅을 늘리고 댓글 데이터 생성
    const queryRunnerForCreate = this.dataSource.createQueryRunner();
    await queryRunnerForCreate.connect();

    await queryRunnerForCreate.startTransaction();
    try {
      // 해당 댓글의 카운팅 데이터
      let foundCountPosition = await this.commentRepository.checkCommentCount(
        boardId,
        queryRunnerForCreate,
      );
      if (!foundCountPosition) {
        // 없으면 생성: 첫번째 댓글
        foundCountPosition = await this.commentRepository.createCommentCount(
          boardId,
          position,
          queryRunnerForCreate,
        );
      } else {
        this.logger.debug(`댓글이 생성되어 ${position}Count 증가`);

        if (position === CommentPosition.POSITIVE)
          foundCountPosition.positiveCount += 1;
        if (position === CommentPosition.NEGATIVE)
          foundCountPosition.negativeCount += 1;
        await this.commentRepository.updateCommentCount(
          boardId,
          foundCountPosition,
          queryRunnerForCreate,
        );
      }

      // 댓글 테이블에 데이터 생성
      createResult = await this.commentRepository.createComment(
        user,
        createCommentDto,
        queryRunnerForCreate,
      );

      // 불필요한 값 제거
      delete createResult.updatedAt;
      delete createResult.deletedAt;

      await queryRunnerForCreate.commitTransaction();
    } catch (err) {
      await queryRunnerForCreate.rollbackTransaction();
    } finally {
      await queryRunnerForCreate.release();
    }

    return createResult;
  }

  // 댓글 삭제 (status: deleted로 변경)
  async deleteComment(reqUserId: string, commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const foundComment = await this.commentRepository.checkComment(commentId);
      if (!foundComment || foundComment.status != CommentStatus.NOT_DELETED) {
        // 이미 삭제됐거나 데이터베이스에서 찾을 수 없는 댓글
        throw new NotFoundException('댓글이 존재하지 않습니다.');
      }
      if (foundComment.userId !== reqUserId) {
        this.logger.error(`삭제 권한이 없는 유저의 요청`);
        throw new ForbiddenException('삭제 권한이 없습니다.');
      }
      const deleteCommentResult = await this.commentRepository.deleteComment(
        reqUserId,
        commentId,
        CommentStatus.DELETED,
      );

      // 쿼리 수행 결과 확인 후, 수정사항이 없을 경우 예외 발생
      if (deleteCommentResult.affected === 0) {
        this.logger.error('COMMENT 테이블을 업데이트 하지 못했습니다.');
        throw new ServiceUnavailableException(
          '알 수 없는 이유로 요청을 완료하지 못했습니다.',
        );
      }

      // 댓글 카운팅 데이터 감소
      const { boardId, position } = foundComment;

      const foundCountPosition = await this.commentRepository.checkCommentCount(
        boardId,
        queryRunner,
      );

      this.logger.debug(`댓글이 삭제되어 ${position}Count 감소`);
      if (position === CommentPosition.POSITIVE)
        foundCountPosition.positiveCount -= 1;
      if (position === CommentPosition.NEGATIVE)
        foundCountPosition.negativeCount -= 1;
      const updateCountResult = await this.commentRepository.updateCommentCount(
        boardId,
        foundCountPosition,
        queryRunner,
      );

      // 쿼리 수행 결과 확인 후, 수정사항이 없을 경우 예외 발생
      if (updateCountResult.affected === 0) {
        this.logger.error(
          'COMMENT_POSITION_COUNT 테이블을 업데이트 하지 못했습니다.',
        );
        throw new ServiceUnavailableException(
          '알 수 없는 이유로 요청을 완료하지 못했습니다.',
        );
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return 'request success';
  }
}
