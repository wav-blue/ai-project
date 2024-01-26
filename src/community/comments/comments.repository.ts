import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Board } from '../boards/boards.entity';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { CommentStatus } from './enum/CommentStatus.enum';
import { Mylogger } from 'src/common/logger/mylogger.service';
import { CommentReport } from './entity/report-comment.entity';
import { Comment } from './entity/comments.entity';
import { CommentPositionCount } from './entity/count-comments.entity';
import { CommentPosition } from './enum/CommentPosition.enum';

@Injectable()
export class CommentRepository {
  private commentRepository: Repository<Comment>;
  private logger = new Mylogger(CommentRepository.name);

  constructor(private readonly dataSource: DataSource) {
    this.commentRepository = this.dataSource.getRepository(Comment);
  }

  async checkCommentCount(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<CommentPositionCount> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select(
        'count.positiveCount AS positiveCount, count.negativeCount AS negativeCount',
      )
      .from(CommentPositionCount, 'count')
      .where(`count.board_id = :boardId`, { boardId })
      .getRawOne();

    return result;
  }

  async createCommentCount(
    boardId: number,
    position: CommentPosition,
    queryRunner: QueryRunner,
  ): Promise<CommentPositionCount> {
    let positiveCount = 0;
    let negativeCount = 0;
    if (position == CommentPosition.POSITIVE) {
      positiveCount = 1;
    } else {
      negativeCount = 1;
    }
    const newCommentPositionCount = queryRunner.manager.create(
      CommentPositionCount,
      {
        boardId,
        positiveCount,
        negativeCount,
      },
    );

    const result = await queryRunner.manager.save(newCommentPositionCount);
    return result;
  }

  async updateCommentCount(
    boardId: number,
    foundCountPosition: { positiveCount: number; negativeCount: number },
    queryRunner: QueryRunner,
  ) {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .update(CommentPositionCount)
      .set(foundCountPosition)
      .where(`board_id = :boardId`, { boardId })
      .execute();
    return result;
  }

  async getCommentCountByBoardId(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<{ positiveCount: number; negativeCount: number }> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select(
        'count.positiveCount AS positiveCount, count.negativeCount AS negativeCount',
      )
      .from(CommentPositionCount, 'count')
      .where('board_id = :boardId', { boardId })
      .getRawOne();
    return result;
  }

  async getAllComments(): Promise<Comment[]> {
    this.logger.log('Comment 조회 실행');
    const found = this.commentRepository
      .createQueryBuilder()
      .select('comment')
      .from(Comment, 'comment')
      .getMany();

    return found;
  }

  async getAnonymousNumber(
    user: string,
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const { boardId } = createCommentDto;
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('DISTINCT `anonymous_number`', 'anonymous_number')
      .from(Comment, 'comment')
      .where(`user_id = :user AND board_id = :boardId`, { user, boardId })
      .getRawMany();

    if (result.length === 0) {
      return null;
    }
    const { anonymous_number } = result[0];
    return parseInt(anonymous_number);
  }

  async getNewAnonymousNumber(
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const { boardId } = createCommentDto;
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(DISTINCT(`user_id`))', 'count')
      .from(Comment, 'comment')
      .where('anonymous_number != 0 and comment.boardId = :boardId', {
        boardId,
      })
      .getRawMany();
    const { count } = result[0];
    return parseInt(count);
  }
  async checkComment(commentId: number) {
    const found = this.commentRepository
      .createQueryBuilder()
      .select('comment')
      .from(Comment, 'comment')
      .where('comment.comment_id = :commentId', { commentId })
      .getOne();

    return found;
  }

  async checkBoard(boardId: number, queryRunner: QueryRunner): Promise<Board> {
    const found = await queryRunner.manager
      .createQueryBuilder()
      .select('board')
      .from(Board, 'board')
      .where('board.board_id = :boardId', {
        boardId,
      })
      .getOne();

    return found;
  }

  async getCommentById(commentId: number): Promise<Comment> {
    const found = this.commentRepository
      .createQueryBuilder()
      .select('comments')
      .from(Comment, 'comments')
      .where('comments.comment_id = :commentId', { commentId })
      .getOne();

    return found;
  }

  async getBoardComments(
    boardId: number,
    page: number,
    limit: number,
    queryRunner: QueryRunner,
  ): Promise<Comment[]> {
    this.logger.log(`${boardId}번 게시글 댓글 조회`);
    this.logger.log(`설정된 page: ${page} / limit: ${limit}`);
    const previous = (page - 1) * limit;
    const comments = await queryRunner.manager
      .createQueryBuilder()
      .select('comment')
      .from(Comment, 'comment')
      .where(`comment.board_id = :boardId`, {
        boardId,
      })
      .skip(previous)
      .take(limit)
      .getMany();

    this.logger.log(`가져온 길이 : ${comments.length}`);
    return comments;
  }

  async getMyComments(
    userId: string,
    page: number,
    limit: number,
    queryRunner: QueryRunner,
  ): Promise<Comment[]> {
    this.logger.log(`${userId}가 작성한 댓글 조회`);
    this.logger.log(`설정된 page: ${page} / limit: ${limit}`);
    const previous = (page - 1) * limit;
    const comments = await queryRunner.manager
      .createQueryBuilder()
      .select('comment')
      .from(Comment, 'comment')
      .where(`comment.user_id = :userId`, {
        userId,
      })
      .skip(previous)
      .take(limit)
      .getMany();
    this.logger.log(`조회된 comments의 length: ${comments.length}`);
    return comments;
  }
  async countCommentsByBoard(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(`comment_id`)', 'count')
      .from(Comment, 'comment')
      .where(`comment.board_id = :boardId`, {
        boardId,
      })
      .getRawOne();
    const total = result.count;
    return total;
  }
  async countCommentsByUser(userId: string, queryRunner): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(`comment_id`)', 'count')
      .from(Comment, 'comment')
      .where(`comment.user_id = :userId`, {
        userId,
      })
      .getRawOne();
    const total = result.count;
    return total;
  }

  async createComment(
    user: string,
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ): Promise<Comment> {
    const newComment = queryRunner.manager.create(Comment, {
      ...createCommentDto,
      userId: user,
      status: CommentStatus.NOT_DELETED,
      deletedAt: null,
    });

    const result = await queryRunner.manager.save(newComment);
    return result;
  }

  async checkReportUser(
    commentId: number,
    queryRunner: QueryRunner,
  ): Promise<{ report_user_id: string }[]> {
    return await queryRunner.manager
      .createQueryBuilder()
      .select('report.report_user_id')
      .from(CommentReport, 'report')
      .where('report.commentId = :commentId', {
        commentId,
      })
      .getRawMany();
  }

  // 신고 내역 업로드
  async createCommentReport(
    createCommentReportDto: CreateCommentReportDto,
    queryRunner: QueryRunner,
  ): Promise<CommentReport> {
    const newReport = queryRunner.manager.create(CommentReport, {
      ...createCommentReportDto,
    });

    const result = await queryRunner.manager.save(newReport);
    return result;
  }

  async deleteComment(
    userId: string,
    commentId: number,
    deleteType: string,
  ): Promise<{ affected: number }> {
    try {
      const result = await this.commentRepository
        .createQueryBuilder()
        .update(Comment)
        .set({
          status: deleteType,
          updatedAt: new Date(),
          deletedAt: new Date(),
        })
        .where('comment_id = :commentId', { commentId })
        .execute();
      const { affected } = result;
      return { affected };
    } catch (error) {
      return error;
    }
  }
}
