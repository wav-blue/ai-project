import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DataSource } from 'typeorm';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import * as config from 'config';
import { CommentStatus } from './enum/CommentStatus.enum';
import { Mylogger } from 'src/common/logger/mylogger.service';
import { AnonymousNumberType } from './enum/AnonymousNumberType.enum';
import { Comment } from './entity/comments.entity';
import { parseDeletedComment, randomPosition } from 'src/utils/comment.util';
import { bytesToBase64 } from 'src/utils/base64Function';
import { CommentPosition } from './enum/CommentPosition.enum';

const flaskConfig = config.get('flask');

@Injectable()
export class CommentsService {
  private readonly logger = new Mylogger(CommentsService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  async getAllComments(): Promise<Comment[]> {
    const found = this.commentRepository.getAllComments();
    return found;
  }

  // 해당 Board의 Comment 조회
  async getBoardComments(
    boardId: number,
    page: number,
    pageSize: number,
  ): Promise<{
    count: number;
    list: Comment[];
    positiveCount: number;
    negativeCount: number;
  }> {
    let results = null;
    let amount = 0;
    let positionCount = {
      positiveCount: 0,
      negativeCount: 0,
    };
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const found = await this.commentRepository.checkBoard(
        boardId,
        queryRunner,
      );
      if (!found) {
        this.logger.error('해당하는 게시글을 찾을 수 없음');
        throw new NotFoundException('해당하는 게시글이 없습니다.');
      }

      results = await this.commentRepository.getBoardComments(
        boardId,
        page,
        pageSize,
        queryRunner,
      );

      amount = await this.commentRepository.countCommentsByBoard(
        boardId,
        queryRunner,
      );
      console.log('11:: ', positionCount);
      // positive, negative 갯수 카운팅
      const foundPositionCount =
        await this.commentRepository.getCommentCountByBoardId(
          boardId,
          queryRunner,
        );
      console.log('22:: ', foundPositionCount);
      if (foundPositionCount) {
        positionCount = foundPositionCount;
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    try {
      // 삭제된 댓글은 자세한 정보 제거
      results = parseDeletedComment(results);

      // 총 페이지 수 계산
      const maxPage = Math.ceil(amount / pageSize);
      this.logger.verbose(
        `데이터베이스에서 조회된 comment의 총 갯수 : ${amount} | 계산된 페이지 수 : ${maxPage}`,
      );
      return {
        count: maxPage,
        list: results,
        ...positionCount,
      };
    } catch (err) {
      throw new ConflictException();
    }
  }

  // 로그인한 유저가 작성한 Comment 조회
  async getMyComments(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ count: number; list: Comment[] }> {
    let results = null;
    let amount = 0;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      results = await this.commentRepository.getMyComments(
        userId,
        page,
        pageSize,
        queryRunner,
      );

      amount = await this.commentRepository.countCommentsByUser(
        userId,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    try {
      // 삭제된 댓글은 자세한 정보 제거
      results = parseDeletedComment(results);

      const maxPage = Math.ceil(amount / pageSize);
      this.logger.log(
        `데이터베이스에서 조회된 comment의 총 갯수 : ${amount} | 계산된 페이지 수 : ${maxPage}`,
      );
      return { count: maxPage, list: results };
    } catch (err) {
      throw new ConflictException();
    }
  }

  // Comment 작성
  async createComment(
    user: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    // Flask 서버로 요청하여 position 설정
    try {
      // flask 서버로 요청 보낼 body 내용
      const apiUrl = `${flaskConfig.url}:${flaskConfig.port}/analysis`;
      const body = {
        content: createCommentDto.content,
      };

      this.logger.log(
        `http://${apiUrl}:${flaskConfig.port}/analysis로 Post 요청!`,
      );

      //const username = 'asdsadsadas' || flaskConfig.username;
      const username = process.env.FLASK_USER_NAME || flaskConfig.username;
      const password = process.env.FLASK_PASSWORD || flaskConfig.password;

      const encodedUsername = bytesToBase64(new TextEncoder().encode(username));
      const encodedPassword = bytesToBase64(new TextEncoder().encode(password));

      const headersRequest = {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedUsername}:${encodedPassword}`,
      };

      const flask_response = await firstValueFrom(
        this.httpService
          .post(apiUrl, body, { headers: headersRequest })
          .pipe(map((res) => res))
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error('Axios Error::', error);
              throw 'Flask Server 에러 발생!';
            }),
          ),
      );
      // 분석된 결과를 DTO에 추가
      this.logger.verbose(`Flask 서버로의 요청 성공!`);
      this.logger.verbose(
        `분석을 통해 position 결정: ${flask_response.data.position}`,
      );
      createCommentDto.position = flask_response.data.position;
    } catch (err) {
      // 모델을 이용한 API 확정 전까지 임시로 position 설정
      const position = randomPosition();
      this.logger.warn(`분석 요청이 실패했습니다. Falsk 서버를 확인해주세요!`);
      this.logger.verbose(`랜덤으로 position을 결정합니다... ${position}`);
      createCommentDto.position = position;

      // throw new ServiceUnavailableException(
      //   `서버의 문제로 댓글을 생성할 수 없습니다.`,
      // );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // 생성된 댓글의 정보를 저장
    let createResult: Comment;
    const { boardId, position } = createCommentDto;
    await queryRunner.startTransaction();
    try {
      // boardId로 게시글 정보 조회
      const foundBoard = await this.commentRepository.checkBoard(
        boardId,
        queryRunner,
      );
      const boardStatus = foundBoard?.status;
      if (!foundBoard || boardStatus !== 'normal') {
        this.logger.error('해당 게시글을 조회할 수 없음');
        if (foundBoard) this.logger.error(`게시글의 상태: ${boardStatus}`);
        throw new NotFoundException('해당하는 게시글이 없습니다.');
      }

      // 긍부정 댓글 갯수를 update
      // comment_position_count에서 해당 테이블의 데이터 확인 및 조회
      let foundCountPosition = await this.commentRepository.checkCommentCount(
        boardId,
        queryRunner,
      );
      if (!foundCountPosition) {
        // 없으면 생성(첫번째 댓글)
        foundCountPosition = await this.commentRepository.createCommentCount(
          boardId,
          position,
          queryRunner,
        );
      } else {
        if (position === CommentPosition.POSITIVE)
          foundCountPosition.positiveCount += 1;
        if (position === CommentPosition.NEGATIVE)
          foundCountPosition.negativeCount += 1;
        await this.commentRepository.updateCommentCount(
          boardId,
          foundCountPosition,
          queryRunner,
        );
      }

      // 익명 번호를 부여
      // 게시글 작성자는 특수 익명 번호 부여(0)
      const boardWriter = foundBoard.userId;
      if (user === boardWriter) {
        createCommentDto.anonymous_number = AnonymousNumberType.WRITER;
        this.logger.verbose(
          `게시글 작성자가 댓글 작성함 : 익명번호 ${AnonymousNumberType.WRITER}`,
        );
      } else {
        // 일반 작성자
        // 이미 댓글을 쓴 적이 있는 유저인지 확인
        const existingAnonymousNumber =
          await this.commentRepository.getAnonymousNumber(
            user,
            createCommentDto,
            queryRunner,
          );
        if (existingAnonymousNumber) {
          createCommentDto.anonymous_number = existingAnonymousNumber;
          this.logger.verbose(
            `기존의 익명 번호가 존재함 : ${existingAnonymousNumber}`,
          );
        } else {
          // 기록이 없을 시 새로 익명 번호 부여
          const new_anonymous_number =
            await this.commentRepository.getNewAnonymousNumber(
              createCommentDto,
              queryRunner,
            );
          createCommentDto.anonymous_number = new_anonymous_number + 1;
          this.logger.verbose(
            `새로 익명 번호가 부여됨 : ${new_anonymous_number + 1}`,
          );
        }
      }

      // 댓글 테이블에 데이터 생성
      createResult = await this.commentRepository.createComment(
        user,
        createCommentDto,
        queryRunner,
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }

    // 불필요한 값 제거
    delete createResult.updatedAt;
    delete createResult.deletedAt;

    return createResult;
  }

  // 신고 내역 작성 && 신고 누적 시 삭제
  async createCommentReport(
    createCommentReportDto: CreateCommentReportDto,
    userId: string,
  ) {
    // 응답으로 보내줄 댓글의 상태 저장
    let commentStatus = CommentStatus.NOT_DELETED;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const { commentId, reportUserId } = createCommentReportDto;

      // 신고된 Comment의 정보 조회
      const foundComment = await this.commentRepository.checkComment(commentId);
      if (!foundComment) {
        this.logger.error(`해당하는 댓글의 정보가 데이터베이스 내에 없음`);
        throw new NotFoundException('이미 삭제된 댓글입니다.');
      }

      if (foundComment.status !== CommentStatus.NOT_DELETED) {
        this.logger.error(
          `댓글의 상태가 ${foundComment.status}이므로 신고할 수 없음`,
        );
        throw new NotFoundException('이미 삭제된 댓글입니다.');
      }
      // if (foundComment.userId === reportUserId) {
      //   this.logger.error(`자신의 댓글은 신고할 수 없습니다.`);
      //   throw new ConflictException('잘못된 신고 요청입니다.');
      // }

      // 댓글 작성자의 id 저장
      const target_user_id = foundComment.userId;
      createCommentReportDto.targetUserId = target_user_id;

      // 해당 댓글을 report한 User들의 기록을 조회
      const checkResult = await this.commentRepository.checkReportUser(
        commentId,
        queryRunner,
      );

      // 동일 인물이 하나의 댓글에 대해 중복 신고
      const reportUserList = [];
      for (let i = 0; i < checkResult.length; i++) {
        if (checkResult[i].report_user_id !== userId) {
          reportUserList.push(checkResult[i].report_user_id);
        } else {
          this.logger.error(`한 유저가 같은 댓글을 두번 신고할 수 없음`);
          throw new ConflictException('이미 신고된 댓글입니다.');
        }
      }

      reportUserList.push(userId);

      await this.commentRepository.createCommentReport(
        createCommentReportDto,
        queryRunner,
      );

      // 일정 횟수 신고되어 댓글 삭제
      if (reportUserList.length >= 5) {
        this.logger.verbose(`${reportUserList.length}회 신고되어 댓글 삭제됨`);
        commentStatus = CommentStatus.REPORTED;
        this.commentRepository.deleteComment(
          target_user_id,
          commentId,
          commentStatus,
        );

        // 긍부정 댓글 카운팅 -1
        const { boardId, position } = foundComment;

        const foundCountPosition =
          await this.commentRepository.checkCommentCount(boardId, queryRunner);

        if (position === CommentPosition.POSITIVE)
          foundCountPosition.positiveCount -= 1;
        if (position === CommentPosition.NEGATIVE)
          foundCountPosition.negativeCount -= 1;
        const updateCountResult =
          await this.commentRepository.updateCommentCount(
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
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    return { status: commentStatus };
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
        this.logger.verbose(
          `요청 유저 아이디: ${reqUserId}\n작성자의 유저 아이디: ${foundComment.userId}`,
        );
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

      // 긍부정 댓글 카운팅 -1
      const { boardId, position } = foundComment;

      const foundCountPosition = await this.commentRepository.checkCommentCount(
        boardId,
        queryRunner,
      );

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
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else if (err instanceof ForbiddenException) {
        throw new ForbiddenException(err.message);
      } else if (err instanceof ServiceUnavailableException) {
        throw new ServiceUnavailableException(err.message);
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    return 'request success';
  }
}
