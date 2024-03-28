import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Board } from '../boards/boards.entity';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { CommentStatus } from './enum/CommentStatus.enum';
import { CommentReport } from './entity/report-comment.entity';
import { Comment } from './entity/comments.entity';
import { CommentPositionCount } from './entity/count-comments.entity';
import { MyLogger } from 'src/logger/logger.service';
import * as dayjs from 'dayjs';
import { QueryPageDto } from './dto/query-page.dto';
import { ReadNewCommentDto } from './dto/read-new-comment.dto';

@Injectable()
export class CommentRepository {
  constructor(
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentRepository.name);
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
    queryRunner: QueryRunner,
  ): Promise<CommentPositionCount> {
    const newCommentPositionCount = queryRunner.manager.create(
      CommentPositionCount,
      {
        boardId,
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

  async getAnonymousNumber(
    boardId: number,
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('DISTINCT `anonymous_number`', 'anonymous_number')
      .from(Comment, 'comment')
      .where(`user_id = :userId AND board_id = :boardId`, { userId, boardId })
      .getRawMany();

    if (result.length === 0) {
      return null;
    }
    const { anonymous_number } = result[0];
    return parseInt(anonymous_number);
  }

  async getNewAnonymousNumber(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('MAX(`anonymous_number`)', 'max')
      .from(Comment, 'comment')
      .where('comment.boardId = :boardId', {
        boardId,
      })
      .getRawMany();
    const { max } = result[0];
    return parseInt(max);
  }
  async checkComment(
    commentId: number,
    queryRunner: QueryRunner,
  ): Promise<Comment> {
    const found = queryRunner.manager
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

  async getBoardComments(
    boardId: number,
    queryPageDto: QueryPageDto,
    queryRunner: QueryRunner,
  ): Promise<Comment[]> {
    const { page, limit } = queryPageDto;
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
    queryPageDto: QueryPageDto,
    queryRunner: QueryRunner,
  ): Promise<Comment[]> {
    const { page, limit } = queryPageDto;
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
  async countCommentsByUser(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
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
    createCommentDto: CreateCommentDto,
    position: string,
    anonymousNumber: number,
    queryRunner: QueryRunner,
  ): Promise<ReadNewCommentDto> {
    const newComment = queryRunner.manager.create(Comment, {
      ...createCommentDto,
      position,
      anonymousNumber,
      status: CommentStatus.NOT_DELETED,
      deletedAt: null,
    });

    const result = await queryRunner.manager.save(newComment);
    return new ReadNewCommentDto(result);
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
    queryRunner: QueryRunner,
  ): Promise<{ affected: number }> {
    try {
      const day = dayjs();

      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Comment)
        .set({
          status: deleteType,
          updatedAt: day.format(),
          deletedAt: day.format(),
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
