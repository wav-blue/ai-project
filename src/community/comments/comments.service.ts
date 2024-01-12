import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

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

  async createComment(user: string, createCommentDto: CreateCommentDto) {
    const result = this.commentRepository.createComment(user, createCommentDto);
    return result;
  }

  async deleteComment(user, commentId: number) {
    const result = this.commentRepository.deleteComment(user, commentId);
    return result;
  }
}
