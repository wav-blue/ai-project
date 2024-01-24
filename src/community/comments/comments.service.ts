import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { Comment } from './comments.entity';
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
  ): Promise<{ count: number; list: Comment[] }> {
    let results = null;
    let amount = 0;
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
      if (!results) {
        return;
      }
      for (let i = 0; i < results.length; i++) {
        delete results[i].userId;
        delete results[i].updatedAt;
        if (results[i].status !== 'normal') {
          results[i].anonymous_number = AnonymousNumberType.DELETED;
          results[i].content = '삭제된 댓글입니다.';
          results[i].status = 'deleted';
          results[i].position = 'deleted';
          results[i].createdAt = 'deleted';
        }
      }
      const maxPage = Math.ceil(amount / pageSize);
      this.logger.verbose(
        `데이터베이스에서 조회된 comment의 총 갯수 : ${amount} | 계산된 페이지 수 : ${maxPage}`,
      );
      return { count: maxPage, list: results };
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
      if (!results) {
        return;
      }
      for (let i = 0; i < results.length; i++) {
        delete results[i].userId;
        delete results[i].updatedAt;
        if (results[i].status !== 'normal') {
          results[i].anonymous_number = AnonymousNumberType.DELETED;
          results[i].content = '삭제된 댓글입니다.';
          results[i].status = 'deleted';
          results[i].position = 'deleted';
          results[i].createdAt = 'deleted';
        }
      }
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
    // 모델을 이용한 API 확정 전까지 임시로 position 설정
    const random_number = Math.random();
    console.log('random: ', random_number);
    let position = 'positive';
    if (random_number < 0.5) {
      position = 'negative';
    }
    createCommentDto.position = position;

    // Flask 서버로 요청하여 position 설정
    // this.logger.error(
    //   `http://${flaskConfig.url}:${flaskConfig.port}/analysis`,
    //   '로 Post 요청!',
    // );

    // // flask 서버로 요청 보낼 body 내용
    // const body = {
    //   content: createCommentDto.content,
    // };

    // const flask_response = await firstValueFrom(
    //   this.httpService
    //     .post(`${flaskConfig.url}:${flaskConfig.port}/analysis`, body)
    //     .pipe(map((res) => res))
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         this.logger.error('Axios Error::', error);
    //         throw 'An error happened!';
    //       }),
    //     ),
    // );
    // // 분석된 결과를 DTO에 추가
    // createCommentDto.position = flask_response.data.position;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // 생성된 댓글의 정보를 저장
    let createResult: Comment;

    await queryRunner.startTransaction();
    try {
      const boardInfoByBoardId = await this.commentRepository.checkBoard(
        createCommentDto.boardId,
        queryRunner,
      );
      const { status } = boardInfoByBoardId;
      if (!boardInfoByBoardId || status !== 'normal') {
        this.logger.error('해당 게시글을 조회할 수 없음');
        if (boardInfoByBoardId) this.logger.error(`게시글의 상태: ${status}`);
        throw new NotFoundException('해당하는 게시글이 없습니다.');
      }

      // 익명 번호를 부여
      // 게시글 작성자는 특수 익명 번호 부여(0)
      const boardWriter = boardInfoByBoardId.userId;
      if (user === boardWriter) {
        createCommentDto.anonymous_number = AnonymousNumberType.WRITER;
        this.logger.verbose(
          `게시글 작성자가 댓글 작성함 : ${AnonymousNumberType.WRITER}`,
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
          createCommentDto.anonymous_number = parseInt(existingAnonymousNumber);
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
          createCommentDto.anonymous_number =
            parseInt(new_anonymous_number) + 1;
          this.logger.verbose(
            `새로 익명 번호가 부여됨 : ${new_anonymous_number}`,
          );
        }
      }

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
    let commentStatus = 'normal';
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const { commentId } = createCommentReportDto;

      // 신고된 Comment의 정보 조회
      const found = await this.commentRepository.checkComment(commentId);
      if (!found) {
        this.logger.error(`해당하는 댓글의 정보가 데이터베이스 내에 없음`);
        throw new NotFoundException('이미 삭제된 댓글입니다.');
      }
      if (found.status !== 'normal') {
        this.logger.error(`댓글의 상태가 ${found.status}이므로 신고할 수 없음`);
        throw new NotFoundException('이미 삭제된 댓글입니다.');
      }

      // 작성자의 id 저장
      const target_user_id = found.userId;

      // 해당 댓글을 report한 User들의 기록을 조회
      const checkResult = await this.commentRepository.checkReportUser(
        commentId,
        queryRunner,
      );
      console.log('checkResult: ', checkResult);
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

      createCommentReportDto.reportUserId = userId;
      createCommentReportDto.targetUserId = target_user_id;

      await this.commentRepository.createCommentReport(
        createCommentReportDto,
        queryRunner,
      );

      console.log('commentStatus: ', commentStatus);
      // 일정 횟수 신고되어 댓글 삭제
      if (reportUserList.length >= 5) {
        this.logger.verbose(`${reportUserList.length}회 신고되어 댓글 삭제됨`);
        commentStatus = CommentStatus.REPORTED;
        this.commentRepository.deleteComment(
          target_user_id,
          commentId,
          commentStatus,
        );
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
    console.log(reqUserId);

    await queryRunner.startTransaction();
    try {
      const found = await this.commentRepository.checkComment(commentId);
      if (!found || found.status != 'normal') {
        // 이미 삭제됐거나 데이터베이스에서 찾을 수 없는 댓글
        throw new NotFoundException('댓글이 존재하지 않습니다.');
      }
      if (found.userId !== reqUserId) {
        this.logger.error(`삭제 권한이 없는 유저의 요청`);
        this.logger.verbose(
          `요청 유저 아이디: ${reqUserId}\n작성자의 유저 아이디: ${found.userId}`,
        );
        throw new ForbiddenException('삭제 권한이 없습니다.');
      }
      const result = await this.commentRepository.deleteComment(
        reqUserId,
        commentId,
        CommentStatus.DELETED,
      );

      // 쿼리 수행 결과 확인 후, 수정사항이 없을 경우 예외 발생 추가예정
      console.log('result: ', result);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else if (err instanceof ForbiddenException) {
        throw new ForbiddenException(err.message);
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    return 'request success';
  }
}
