import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateCommentDto } from './dto/createComment.dto';
import { CreateCommentReportDto } from './dto/createCommentReport.dto';
import { CommentStatus } from './enum/commentStatus.enum';
import { CommentReport } from './entity/reportComment.entity';
import { Comment } from './entity/comments.entity';
import { MyLogger } from 'src/logger/logger.service';
import * as dayjs from 'dayjs';
import { QueryPageDto } from './dto/queryPage.dto';
import { ReadNewCommentDto } from './dto/readNewComment.dto';
import { CommentPosition } from './enum/commentPosition.enum';
import { AnonymousNumberComment } from './entity/anonymousNumberComment.entity';

@Injectable()
export class CommentRepository {
  constructor(private logger: MyLogger) {
    this.logger.setContext(CommentRepository.name);
  }

  /**commentId로 Comment 조회*/
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

  /**특정 게시글, 페이지의 Comment 조회*/
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

  /** 특정 유저의 Comment 조회 */
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

  /** 특정 유저, 특정 게시글의 익명 번호 조회*/
  async getAnonymousNumber(
    boardId: number,
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('anonymous_number')
      .from(AnonymousNumberComment, 'ANC')
      .where(`user_id = :userId AND board_id = :boardId`, { userId, boardId })
      .getRawOne();

    if (!result) {
      return null;
    }
    const { anonymous_number } = result;
    return parseInt(anonymous_number);
  }

  /**특정 게시글에 작성된 Comment 중에서
   * 가장 높은 익명 번호 조회
   * - 익명 번호 데이터 생성 시 활용 */
  async getNewAnonymousNumber(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('MAX(`anonymous_number`)', 'max')
      .from(AnonymousNumberComment, 'ANC')
      .where('ANC.boardId = :boardId', {
        boardId,
      })
      .getRawMany();
    const { max } = result[0];
    return parseInt(max);
  }

  /** 특정 게시글에 작성된 Comment 카운트 */
  async countCommentByBoardId(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<any> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('position, COUNT(1)')
      .from(Comment, 'comment')
      .where({ boardId })
      .groupBy('comment.position')
      .getRawMany();

    return result;
  }

  /** 특정 유저가 작성한 Comment 카운트 */
  async countCommentsByUser(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(1)', 'count')
      .from(Comment, 'comment')
      .where(`comment.user_id = :userId`, {
        userId,
      })
      .getRawOne();
    const total = result.count;
    return total;
  }

  /** Comment 테이블 데이터 생성 */
  async createComment(
    createCommentDto: CreateCommentDto,
    position: CommentPosition,
    queryRunner: QueryRunner,
  ): Promise<ReadNewCommentDto> {
    const newComment = queryRunner.manager.create(Comment, {
      ...createCommentDto,
      position,
      status: CommentStatus.NOT_DELETED,
      deletedAt: null,
    });

    const result = await queryRunner.manager.save(newComment);
    return new ReadNewCommentDto(result);
  }

  /** Anonymous Number Comment 테이블 데이터 생성 */
  async createAnonymousNumber(
    boardId: number,
    userId: string,
    anonymousNumber: number,
    queryRunner: QueryRunner,
  ): Promise<ReadNewCommentDto> {
    const newComment = queryRunner.manager.create(AnonymousNumberComment, {
      boardId,
      userId,
      anonymousNumber,
      deletedAt: null,
    });

    const result = await queryRunner.manager.save(newComment);
    return new ReadNewCommentDto(result);
  }

  /** 특정 Comment의 신고 유저 목록 조회 */
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

  /** Comment Report 테이블 데이터 추가 */
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

  /** Comment 테이블 데이터 삭제 */
  async deleteComment(
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

  /**Comment 테이블의 Position 컬럼 수정 */
  async updateCommentPosition(
    commentId: number,
    position: CommentPosition,
    queryRunner: QueryRunner,
  ): Promise<{ affected: number }> {
    try {
      const day = dayjs();
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Comment)
        .set({
          position,
          updatedAt: day.format(),
        })
        .where('comment_id = :commentId', { commentId })
        .execute();

      const { affected } = result;
      console.log(affected);
      return { affected };
    } catch (err) {}
  }
}
