import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommentStatus } from '.././enum/commentStatus.enum';
import { MyLogger } from 'src/logger/logger.service';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class DeleteCommentReportedService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(DeleteCommentReportedService.name);
  }

  // 신고 누적으로 삭제
  async deleteCommentReported(commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      // 일정 횟수 신고되어 댓글 삭제
      this.logger.verbose(
        `${commentId}번 댓글 ${CommentStatus.REPORTED} 상태로 변경됨`,
      );

      await this.commentRepository.deleteComment(
        commentId,
        CommentStatus.REPORTED,
        queryRunner,
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return { status: CommentStatus.REPORTED };
  }
}
