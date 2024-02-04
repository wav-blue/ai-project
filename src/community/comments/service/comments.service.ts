import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { DataSource } from 'typeorm';
import { CommentStatus } from '.././enum/CommentStatus.enum';
import { CommentPosition } from '.././enum/CommentPosition.enum';
import { MyLogger } from 'src/logger/logger.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentsService.name);
  }

  private checkAffectedDB(queryAffected: number) {
    if (queryAffected === 0) {
      this.logger.error('DB에서 업데이트 된 내용이 존재하지 않습니다.');
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 요청을 완료하지 못했습니다. 데이터베이스를 확인해주세요.',
      );
    }
  }

  // 댓글 삭제 (status를 deleted로 변경)
  async deleteComment(reqUserId: string, commentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const foundComment = await this.commentRepository.checkComment(commentId);
      if (!foundComment || foundComment.status != CommentStatus.NOT_DELETED) {
        // 이미 삭제됐거나 데이터베이스에서 찾을 수 없는 댓글
        throw new NotFoundException('댓글이 존재하지 않습니다.');
      }
      if (foundComment.userId !== reqUserId) {
        this.logger.error(`삭제 권한이 없는 유저의 요청`);
        throw new ForbiddenException('삭제 권한이 없습니다.');
      }
      const deleteCommentResult = await this.commentRepository.deleteComment(
        reqUserId,
        commentId,
        CommentStatus.DELETED,
      );

      // 쿼리 수행 결과 확인 후, 수정사항이 없을 경우 예외 발생
      if (deleteCommentResult.affected === 0) {
        this.logger.error('COMMENT 테이블을 업데이트 하지 못했습니다.');
        throw new ServiceUnavailableException(
          '알 수 없는 이유로 요청을 완료하지 못했습니다.',
        );
      }

      // 댓글 카운팅 데이터 감소
      const { boardId, position } = foundComment;

      const foundCountPosition = await this.commentRepository.checkCommentCount(
        boardId,
        queryRunner,
      );

      this.logger.debug(`댓글이 삭제되어 ${position}Count 감소`);
      if (position === CommentPosition.POSITIVE)
        foundCountPosition.positiveCount -= 1;
      if (position === CommentPosition.NEGATIVE)
        foundCountPosition.negativeCount -= 1;
      const updateCountResult = await this.commentRepository.updateCommentCount(
        boardId,
        foundCountPosition,
        queryRunner,
      );

      // 쿼리 수행 결과 확인 후, 수정사항이 없을 경우 예외 발생
      if (updateCountResult.affected === 0) {
        this.logger.error(
          'COMMENT_POSITION_COUNT 테이블을 업데이트 하지 못했습니다.',
        );
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
