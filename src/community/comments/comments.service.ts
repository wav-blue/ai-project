import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { Comment } from './comments.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async getAllComments(): Promise<Comment[]> {
    const found = this.commentRepository.getAllComments();
    return found;
  }

  async getBoardComments(boardId: number): Promise<Comment[]> {
    const found = this.commentRepository.getBoardComments(boardId);
    return found;
  }
}
