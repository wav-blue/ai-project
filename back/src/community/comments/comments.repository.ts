import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateCommentDto } from './dto/createComment.dto';
import { Board } from '../boards/boards.entity';
import { CreateCommentReportDto } from './dto/createCommentReport.dto';
import { CommentStatus } from './enum/commentStatus.enum';
import { CommentReport } from './entity/reportComment.entity';
import { Comment } from './entity/comments.entity';
import { MyLogger } from 'src/logger/logger.service';
import * as dayjs from 'dayjs';
import { QueryPageDto } from './dto/queryPage.dto';
import { ReadNewCommentDto } from './dto/readNewComment.dto';

@Injectable()
export class CommentRepository {
  constructor(private logger: MyLogger) {
    this.logger.setContext(CommentRepository.name);
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

    return comments;
  }

  async getMyComments(
    userId: string,
    queryPageDto: QueryPageDto,
    queryRunner: QueryRunner,
  ): Promise<Comment[]> {
    const { page, limit } = queryPageDto;

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

    return comments;
  }

  async countCommentGroupByPositionByBoardId(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<{ positiveCount: number; negativeCount: number }> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('comment.position', 'group')
      .addSelect('COUNT(*)', 'count')
      .from(Comment, 'comment')
      .groupBy('comment.position')
      .where(`comment.board_id = :boardId`, { boardId })
      .getRawMany();

    const countJson = { positiveCount: 0, negativeCount: 0 };

    if (result[0].group == 'positive') {
      countJson.positiveCount = parseInt(result[0].count);
      countJson.negativeCount = parseInt(result[1].count);
    } else {
      countJson.positiveCount = parseInt(result[1].count);
      countJson.negativeCount = parseInt(result[0].count);
    }

    return countJson;
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

  // 신고 내역이 있는 유저인지 확인
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
