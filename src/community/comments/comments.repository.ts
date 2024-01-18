import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Board } from '../boards/boards.entity';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';

@Injectable()
export class CommentRepository {
  private commentRepository: Repository<Comment>;
  private logger = new Logger('commentRepository');

  constructor(private readonly dataSource: DataSource) {
    this.commentRepository = this.dataSource.getRepository(Comment);
  }

  async getAllComments(): Promise<Comment[]> {
    this.logger.log('Comment 조회 실행');
    const found = this.commentRepository
      .createQueryBuilder()
      .select('comments')
      .from(Comment, 'comments')
      .getMany();

    return found;
  }

  async getAnonymousNumber(
    user: string,
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ) {
    const { boardId } = createCommentDto;
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('DISTINCT `anonymous_number`', 'anonymous_number')
      .from(Comment, 'comment')
      .where(`user_id = :user AND board_id = :boardId`, { user, boardId })
      .getRawMany();

    if (result.length === 0) {
      return 0;
    }
    const { anonymous_number } = result[0];
    return anonymous_number;
  }

  async getNewAnonymousNumber(
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ) {
    const { boardId } = createCommentDto;
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(DISTINCT(`user_id`))', 'count')
      .from(Comment, 'comment')
      .where({ boardId })
      .getRawMany();
    console.log('count : ');
    const { count } = result[0];
    return count;
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

  async checkBoard(boardId: number, queryRunner: QueryRunner) {
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

  async getBoardComments(boardId: number): Promise<Comment[]> {
    this.logger.log(`${boardId}번 게시글 댓글 조회`);
    const comments = this.commentRepository
      .createQueryBuilder()
      .select('comment')
      .from(Comment, 'comment')
      .where(`comment.board_id = :boardId`, {
        boardId,
      })
      .getMany();

    return comments;
  }

  async createComment(
    user: string,
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ) {
    const { boardId, content, anonymous_number } = createCommentDto;
    this.logger.log(`${user}가 ${boardId}번 게시글 댓글 작성`);

    const newComment = queryRunner.manager.create(Comment, {
      boardId,
      userId: user,
      content,
      anonymous_number,
      position: 'positive',
      status: 'normal',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    console.log('newComment', newComment);
    const result = await queryRunner.manager.save(newComment);
    return result;
  }

  // 신고 내역 업로드
  async createCommentReport(
    createCommentReportDto: CreateCommentReportDto,
    queryRunner: QueryRunner,
  ) {
    const newReport = queryRunner.manager.create(Comment, {
      ...createCommentReportDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    console.log('newComment', newReport);
    const result = await queryRunner.manager.save(newReport);
    return result;
  }

  async deleteComment(user, commentId) {
    try {
      const result = await this.commentRepository
        .createQueryBuilder()
        .update(Comment)
        .set({
          status: 'deleted',
          deletedAt: new Date(),
        })
        .where('comment_id = :commentId', { commentId })
        .execute();
      return result;
    } catch (error) {
      throw new ConflictException('댓글 삭제에 실패했습니다');
    }
  }
}
