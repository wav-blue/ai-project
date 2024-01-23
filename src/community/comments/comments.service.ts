import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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

const flaskConfig = config.get('flask');

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

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
    this.logger.log('logger 테스트');
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
        delete results[i].updatedAt;
        delete results[i].deletedAt;
        if (results[i].status !== 'normal') {
          results[i].anonymous_number = 0;
          results[i].content = '삭제된 댓글입니다.';
          results[i].status = 'deleted';
          results[i].position = 'deleted';
          results[i].createdAt = 'deleted';
        }
      }
      const maxPage = Math.ceil(amount / pageSize);
      this.logger.log(
        `데이터베이스에서 조회된 comment의 총 갯수 : ${amount}\n계산된 페이지 수 : ${maxPage}`,
      );
      return { count: maxPage, list: results };
    } catch (err) {
      throw new ConflictException();
    }
  }

  // 해당 Board의 Comment 조회
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
        delete results[i].updatedAt;
        delete results[i].deletedAt;
        if (results[i].status !== 'normal') {
          results[i].anonymous_number = 0;
          results[i].content = '삭제된 댓글입니다.';
          results[i].status = 'deleted';
          results[i].position = 'deleted';
          results[i].createdAt = 'deleted';
        }
      }
      const maxPage = Math.ceil(amount / pageSize);
      this.logger.log(
        `데이터베이스에서 조회된 comment의 총 갯수 : ${amount}\n계산된 페이지 수 : ${maxPage}`,
      );
      return { count: maxPage, list: results };
    } catch (err) {
      throw new ConflictException();
    }
  }

  // Comment 작성
  async createComment(user: string, createCommentDto: CreateCommentDto) {
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

    let createResult;

    await queryRunner.startTransaction();
    try {
      const foundByBoardId = await this.commentRepository.checkBoard(
        createCommentDto.boardId,
        queryRunner,
      );

      if (!foundByBoardId) {
        throw new NotFoundException('해당하는 게시글이 없습니다.');
      }

      // 이미 댓글을 쓴 적이 있는 유저인지 확인
      const anonymous_number = await this.commentRepository.getAnonymousNumber(
        user,
        createCommentDto,
        queryRunner,
      );
      createCommentDto.anonymous_number = parseInt(anonymous_number);
      this.logger.log(`익명 번호 ${anonymous_number}으로 댓글 생성`);
      if (!anonymous_number) {
        // 기록이 없을 시 새로 익명 번호 부여
        const new_anonymous_number =
          await this.commentRepository.getNewAnonymousNumber(
            createCommentDto,
            queryRunner,
          );

        createCommentDto.anonymous_number = parseInt(new_anonymous_number) + 1;
        this.logger.log('새로 부여한 유저 번호: ', new_anonymous_number);
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
      if (!found || found.status !== 'normal') {
        // deleted 상태이거나 데이터베이스에서 찾을 수 없는 댓글
        throw new ConflictException('이미 삭제된 댓글입니다.');
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
          reportUserList.push(checkResult[i].report_user_id);
          this.logger.warn('⚠️ 동일한 인물의 신고 발생!');
          //throw new ConflictException('이미 신고된 댓글입니다.');
        }
      }

      reportUserList.push(userId);
      console.log('reportUserList: ', reportUserList);

      await this.commentRepository.createCommentReport(
        createCommentReportDto,
        userId,
        target_user_id,
        queryRunner,
      );

      // 일정 횟수 신고되어 댓글 삭제
      if (reportUserList.length === 5) {
        this.logger.log(`${reportUserList.length}회 신고되어 댓글 삭제됨`);
        this.commentRepository.deleteComment(
          target_user_id,
          commentId,
          CommentStatus.REPORTED,
        );
        commentStatus = 'reported';
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
  async deleteComment(user: string, commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const found = await this.commentRepository.checkComment(commentId);
      if (!found || found.status != 'normal') {
        // 이미 삭제됐거나 데이터베이스에서 찾을 수 없는 댓글
        throw new NotFoundException('댓글이 존재하지 않습니다.');
      }
      const result = await this.commentRepository.deleteComment(
        user,
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
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    return 'request success';
  }
}
