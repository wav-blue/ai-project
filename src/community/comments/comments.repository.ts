import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Comment } from './comments.entity';

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
}
