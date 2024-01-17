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
import { parseDateTimeToString } from 'src/utils/dateFunction';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getAllComments(): Promise<Comment[]> {
    const found = this.commentRepository.getAllComments();
    return found;
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

      results = this.commentRepository.getBoardComments(boardId);

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
    return results;
  }

  // Comment 작성
  async createComment(user: string, createCommentDto: CreateCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const found = await this.commentRepository.checkBoard(
        createCommentDto.boardId,
        queryRunner,
      );

      if (!found) {
        throw new NotFoundException('해당하는 게시글이 없습니다.');
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
  async createCommentReport(createCommentReportDto: CreateCommentReportDto) {
    const { commentId } = createCommentReportDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    console.log('queryRunner 시도');
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
    console.log('queryRunner 시도');
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
