import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommentStatus } from '.././enum/commentStatus.enum';
import { MyLogger } from 'src/logger/logger.service';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class DeleteCommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(DeleteCommentService.name);
  }

  // 댓글 삭제 (status를 deleted로 변경)
  async deleteComment(userId: string, commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const foundComment = await this.commentRepository.checkComment(
        commentId,
        queryRunner,
      );
      if (!foundComment || foundComment.status != CommentStatus.NOT_DELETED) {
        // 이미 삭제됐거나 데이터베이스에서 찾을 수 없는 댓글
        throw new NotFoundException('댓글이 존재하지 않습니다.');
      }
      if (foundComment.userId !== userId) {
        throw new ForbiddenException('삭제 권한이 없습니다.');
      }
      const deleteCommentResult = await this.commentRepository.deleteComment(
        commentId,
        CommentStatus.DELETED,
        queryRunner,
      );

      if (deleteCommentResult.affected === 0) {
        this.logger.error('COMMENT 테이블을 업데이트 하지 못했습니다.');
        this.logger.info(`- commentId: ${commentId}`);
        throw new ServiceUnavailableException(
          '알 수 없는 이유로 요청을 완료하지 못했습니다.',
        );
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return 'request success';
  }
}
