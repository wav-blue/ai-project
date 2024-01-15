import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Board } from '../boards/boards.entity';

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

  async checkBoardNull() {
    // 테스트용으로 Null 반환
    // 해당하는 게시글이 없는 상황을 가정
    return null;
  }

  async checkBoard(boardId: number, queryRunner: QueryRunner) {
    const found = await queryRunner.manager
      .createQueryBuilder()
      .select('boards')
      .from(Board, 'boards')
      .where('boards.board_id = :boardId', {
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
    const found = this.commentRepository
      .createQueryBuilder()
      .select('comments')
      .from(Comment, 'comments')
      .where('comments.board_id = :boardId', { boardId })
      .getMany();

    return found;
  }

  async createComment(
    user: string,
    createCommentDto: CreateCommentDto,
    queryRunner: QueryRunner,
  ) {
    const { boardId, content } = createCommentDto;
    this.logger.log(`${user}가 ${boardId}번 게시글 댓글 작성`);
    try {
      // 1. 추가한 값이 필요 없는 경우 return값 : string
      //   const sqlResult = await queryRunner.manager
      //     .createQueryBuilder()
      //     .insert()
      //     .into(Comment)
      //     .values({
      //       boardId,
      //       userId: user,
      //       content,
      //       position: 'positive',
      //       status: 'not_deleted',
      //       createdAt: new Date(),
      //       updatedAt: new Date(),
      //     })
      //     .execute();
      //   if (sqlResult.raw.affectedRows === 0) {
      //     throw new ConflictException('댓글 작성에 실패했습니다');
      //   }
      //   return '작성 완료';
      // 2. 추가한 값이 필요한 경우 return값 : json
      const newComment = this.commentRepository.create({
        boardId,
        userId: user,
        content,
        position: 'positive',
        status: 'not_deleted',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      console.log('newComment', newComment);
      const result = await this.commentRepository.save(newComment);
      return result;
    } catch (error) {
      throw new ConflictException('댓글 작성에 실패했습니다');
    }
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
