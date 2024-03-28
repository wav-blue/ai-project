import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { DataSource } from 'typeorm';
import { Comment } from '.././entity/comments.entity';
import { CommentStatus } from '.././enum/CommentStatus.enum';
import { AnonymousNumberType } from '.././enum/AnonymousNumberType.enum';
import { MyLogger } from 'src/logger/logger.service';
import { QueryPageDto } from '../dto/query-page.dto';

@Injectable()
export class CommentsReadService {
  // private logger = new MyLogger(CommentsReadService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentsReadService.name);
  }

  // 삭제된 데이터의 정보를 숨김
  private parseDeletedComment(comments: Comment[]): Comment[] {
    for (let i = 0; i < comments.length; i++) {
      delete comments[i].updatedAt;
      if (comments[i].status !== CommentStatus.NOT_DELETED) {
        comments[i].anonymousNumber = AnonymousNumberType.DELETED;
        comments[i].content = '삭제된 댓글입니다.';
        comments[i].status = CommentStatus.DELETED;
        comments[i].position = 'deleted';
      }
    }
    return comments;
  }

  // 해당 Board의 Comment 조회
  async getBoardComments(
    boardId: number,
    queryPageDto: QueryPageDto,
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
        throw new NotFoundException('해당하는 게시글이 없습니다.');
      }

      results = await this.commentRepository.getBoardComments(
        boardId,
        queryPageDto,
        queryRunner,
      );

      amount = await this.commentRepository.countCommentsByBoard(
        boardId,
        queryRunner,
      );
      // positive, negative 갯수 카운팅
      const foundPositionCount =
        await this.commentRepository.getCommentCountByBoardId(
          boardId,
          queryRunner,
        );
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
      results = this.parseDeletedComment(results);

      return {
        count: amount,
        list: results,
        ...positionCount,
      };
    } catch (err) {
      this.logger.error('삭제된 댓글의 정보 제거 중 오류 발생');
      throw new ConflictException(
        '알 수 없는 이유로 요청을 완료하지 못했습니다.',
      );
    }
  }

  // 로그인한 유저가 작성한 Comment 조회
  async getMyComments(
    userId: string,
    queryPageDto: QueryPageDto,
  ): Promise<{ count: number; list: Comment[] }> {
    let results = null;
    let amount = 0;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      results = await this.commentRepository.getMyComments(
        userId,
        queryPageDto,
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
      results = this.parseDeletedComment(results);
      return { count: amount, list: results };
    } catch (err) {
      this.logger.error('삭제된 댓글의 정보 제거 중 오류 발생');
      throw new InternalServerErrorException(
        '알 수 없는 이유로 요청을 완료하지 못했습니다.',
      );
    }
  }
}
