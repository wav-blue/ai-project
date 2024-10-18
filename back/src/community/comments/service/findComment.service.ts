import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Comment } from '.././entity/comments.entity';
import { MyLogger } from 'src/logger/logger.service';
import { CommentStatus } from '../enum/commentStatus.enum';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class FindCommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private logger: MyLogger,
  ) {
    this.logger.setContext(FindCommentService.name);
  }

  // 해당 Comment 조회
  async getCommentByCommentIdWithQueryRunner(
    commentId: number,
    queryRunner: QueryRunner,
  ): Promise<Comment> {
    const foundComment = await this.commentRepository.checkComment(
      commentId,
      queryRunner,
    );

    // 보안을 위해 같은 예외 응답
    if (!foundComment || foundComment.status !== CommentStatus.NOT_DELETED) {
      if (!foundComment) {
        this.logger.debug(`해당하는 댓글의 정보가 데이터베이스 내에 없음`);
      }

      if (foundComment.status !== CommentStatus.NOT_DELETED) {
        this.logger.debug(
          `댓글의 상태가 ${foundComment.status}이므로 신고할 수 없음`,
        );
      }
      throw new NotFoundException('해당하는 댓글이 없습니다.');
    }

    return foundComment;
  }
}
