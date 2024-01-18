import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DataSource } from 'typeorm';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';

@Injectable()
export class CommentsService {
  private logger = new Logger('CommentsService');
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getAllComments(): Promise<Comment[]> {
    const found = this.commentRepository.getAllComments();
    return found;
  }

  async getMyComments(userId: string, page: number): Promise<Comment[]> {
    let results = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      results = await this.commentRepository.getMyComments(
        userId,
        page,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException();
      } else {
        throw new ConflictException();
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
      // const comments: ReadCommentDto[] = results.map((comment: any) => {
      //   if (comment.status !== 'normal') {
      //     comment.anonymous_number = 0;
      //     comment.content = '삭제된 댓글입니다.';
      //     comment.status = 'deleted';
      //     comment.position = 'deleted';
      //     comment.createdAt = 'deleted';
      //     return new ReadCommentDto(comment);
      //   } else {
      //     comment.createdAt = parseDateTimeToString(comment.createdAt);
      //     new ReadCommentDto(comment);
      //   }
      // });
      return results;
    } catch (err) {
      throw new ConflictException();
    }
  }

  // 해당 Board의 Comment 조회
  async getBoardComments(boardId: number, page: number): Promise<Comment[]> {
    let results = null;

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
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException();
      } else {
        throw new ConflictException();
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
      // const comments: ReadCommentDto[] = results.map((comment: any) => {
      //   if (comment.status !== 'normal') {
      //     comment.anonymous_number = 0;
      //     comment.content = '삭제된 댓글입니다.';
      //     comment.status = 'deleted';
      //     comment.position = 'deleted';
      //     comment.createdAt = 'deleted';
      //     return new ReadCommentDto(comment);
      //   } else {
      //     comment.createdAt = parseDateTimeToString(comment.createdAt);
      //     new ReadCommentDto(comment);
      //   }
      // });
      return results;
    } catch (err) {
      throw new ConflictException();
    }
  }

  // Comment 작성
  async createComment(user: string, createCommentDto: CreateCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

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
      if (anonymous_number === 0) {
        // 기록이 없을 시 새로 익명 번호 부여
        const new_anonymous_number =
          await this.commentRepository.getNewAnonymousNumber(
            createCommentDto,
            queryRunner,
          );

        createCommentDto.anonymous_number = parseInt(new_anonymous_number) + 1;
        this.logger.log('새로 부여한 유저 번호: ', new_anonymous_number);
      }
      await this.commentRepository.createComment(
        user,
        createCommentDto,
        queryRunner,
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else {
        throw new ConflictException(err.message);
      }
    } finally {
      await queryRunner.release();
    }

    return 'request success';
  }

  // 신고 내역 작성 && 신고 누적 시 삭제
  async createCommentReport(
    createCommentReportDto: CreateCommentReportDto,
    userId: string,
  ) {
    const { commentId } = createCommentReportDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const found = null;
      if (!found) {
        // deleted 상태이거나 데이터베이스에서 찾을 수 없는 댓글
        throw new ConflictException('이미 삭제된 댓글입니다.');
      }
      await this.commentRepository.createCommentReport(
        createCommentReportDto,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else {
        throw new ConflictException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    return 'request success';
  }

  // 댓글 상태 변경
  async deleteComment(user: string, commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const found = await this.commentRepository.checkComment(commentId);
      if (!found || found.status != 'normal') {
        // deleted 상태이거나 데이터베이스에서 찾을 수 없는 댓글
        throw new NotFoundException('댓글이 존재하지 않습니다.');
      }
      const result = await this.commentRepository.deleteComment(
        user,
        commentId,
      );

      console.log('result: ', result);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else {
        throw new ConflictException(err.message);
      }
    } finally {
      await queryRunner.release();
    }
    return 'request success';
  }
}
