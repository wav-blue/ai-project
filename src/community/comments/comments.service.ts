import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EntityNotFoundException } from 'src/common/exception/service.exception';

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
    // 존재하는 게시글 번호인지 체크
    // test용으로 null 반환
    const found = await this.commentRepository.checkBoardNull();

    if (!found) {
      throw EntityNotFoundException('해당하는 게시물이 존재하지 않습니다');
    }

    const result = this.commentRepository.createComment(user, createCommentDto);
    return result;
  }

  async deleteComment(user, commentId: number) {
    const result = this.commentRepository.deleteComment(user, commentId);
    return result;
  }
}
