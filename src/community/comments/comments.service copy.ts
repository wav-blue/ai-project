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
import { AnonymousNumberType } from './enum/AnonymousNumberType.enum';
import { Comment } from './entity/comments.entity';
import { randomPosition, bytesToBase64 } from './comment.util';
import { CommentPosition } from './enum/CommentPosition.enum';
import * as dayjs from 'dayjs';
import { MyLogger } from 'src/common/logger/logger.service';

const flaskConfig = config.get('flask');

@Injectable()
export class CommentsService {
  private readonly logger = new MyLogger(CommentsService.name);

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

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}
  //하나의 서비스 로직에서 많은 책임을 가지고 있음

  /*
    createComment , 신고작성/ 댓글삭제
*/

  // Comment 작성
  async createComment(
    user: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    // DTO의 createdAt, updatedAt, deletedAt 설정
    createCommentDto = this.setTimeOfCreateDto(createCommentDto);

    // Flask 서버로 요청하여 position 설정
    try {
      // flask 서버로 요청 보낼 body 내용
      const apiUrl =
        `http://${flaskConfig.url}` + ':' + `${flaskConfig.port}/analysis`;
      const body = {
        content: createCommentDto.content,
      };

      this.logger.log(`http://${apiUrl}로 Post 요청!`);

      //const username = 'asdsadsadas' || flaskConfig.username;
      const username = process.env.FLASK_USER_NAME || flaskConfig.username;
      const password = process.env.FLASK_PASSWORD || flaskConfig.password;

      const encodedUsername = bytesToBase64(new TextEncoder().encode(username));
      const encodedPassword = bytesToBase64(new TextEncoder().encode(password));

      const headersRequest = {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedUsername}:${encodedPassword}`,
      };
      this.logger.verbose(
        `인증 헤더의 내용: Basic ${encodedUsername}:${encodedPassword}`,
      );

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
  async createCommentReport(createCommentReportDto: CreateCommentReportDto) {
    // DTO 설정
    createCommentReportDto = this.setTimeOfCreateDto(createCommentReportDto);

    // 변수 선언
    let foundComment: Comment;
    let commentStatus = CommentStatus.NOT_DELETED;
    const reportUserList = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const { commentId, reportUserId } = createCommentReportDto;

      // 신고된 Comment의 정보 조회
      foundComment = await this.commentRepository.checkComment(commentId);
      if (!foundComment || foundComment.status !== CommentStatus.NOT_DELETED) {
        if (!foundComment) {
          this.logger.error(`해당하는 댓글의 정보가 데이터베이스 내에 없음`);
        } else {
          this.logger.error(
            `댓글의 상태가 ${foundComment.status}이므로 신고할 수 없음`,
          );
        }
        throw new NotFoundException('이미 삭제된 댓글입니다.');
      }

      if (foundComment.userId === reportUserId) {
        this.logger.warn(
          `자신의 댓글은 신고할 수 없습니다! 개발 편의를 위해 에러를 주석 처리`,
        );
        //   throw new ConflictException('잘못된 신고 요청입니다.');
      }

      // 댓글 작성자의 id 저장
      createCommentReportDto.targetUserId = foundComment.userId;

      // 해당 댓글을 report한 User들의 기록을 조회
      const checkResult = await this.commentRepository.checkReportUser(
        commentId,
        queryRunner,
      );

      // 동일 인물이 하나의 댓글에 대해 중복 신고
      for (let i = 0; i < checkResult.length; i++) {
        if (checkResult[i].report_user_id !== reportUserId) {
          reportUserList.push(checkResult[i].report_user_id);
        } else {
          this.logger.error(`한 유저가 같은 댓글을 두번 신고할 수 없음`);
          throw new ConflictException('이미 신고된 댓글입니다.');
        }
      }

      reportUserList.push(reportUserId);

      await this.commentRepository.createCommentReport(
        createCommentReportDto,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    if (reportUserList.length < 5) {
      return { status: commentStatus };
    }

    const QueryRunnerForDelete = this.dataSource.createQueryRunner();
    await QueryRunnerForDelete.connect();

    await QueryRunnerForDelete.startTransaction();

    try {
      // 일정 횟수 신고되어 댓글 삭제
      this.logger.verbose(
        `${reportUserList.length}회 신고되어 댓글 ${CommentStatus.REPORTED} 상태로 변경됨`,
      );
      const { targetUserId, commentId } = createCommentReportDto;
      commentStatus = CommentStatus.REPORTED;

      const updateCommentResult = await this.commentRepository.deleteComment(
        targetUserId,
        commentId,
        commentStatus,
      );

      // 변경된 내용이 없는 경우
      this.checkAffectedDB(updateCommentResult.affected);

      // 긍부정 댓글 카운팅 -1
      const { boardId, position } = foundComment;

      const foundCountPosition = await this.commentRepository.checkCommentCount(
        boardId,
        QueryRunnerForDelete,
      );

      this.logger.debug(`댓글이 신고되어 ${position}Count 감소`);
      if (position === CommentPosition.POSITIVE)
        foundCountPosition.positiveCount -= 1;
      if (position === CommentPosition.NEGATIVE)
        foundCountPosition.negativeCount -= 1;
      const updateCountResult = await this.commentRepository.updateCommentCount(
        boardId,
        foundCountPosition,
        QueryRunnerForDelete,
      );

      // 변경된 내용이 없는 경우
      this.checkAffectedDB(updateCountResult.affected);

      await QueryRunnerForDelete.commitTransaction();
    } catch (err) {
      await QueryRunnerForDelete.rollbackTransaction();
      throw err;
    } finally {
      await QueryRunnerForDelete.release();
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
