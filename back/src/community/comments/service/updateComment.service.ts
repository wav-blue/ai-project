import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { DataSource } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { CommentPosition } from '../enum/commentPosition.enum';

@Injectable()
export class UpdateCommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(UpdateCommentService.name);
  }

  // Loading 상태의 Comment Position 수정
  async updateCommentPostion(
    commentId: number,
    position: CommentPosition,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      // 해당 댓글 조회
      const foundComment = await this.commentRepository.checkComment(
        commentId,
        queryRunner,
      );

      if (!foundComment) {
        this.logger.error(
          `ERROR!!\n<<LOG>>\n- commentId: ${commentId}\n- position: ${position}`,
        );
      }

      // 댓글 데이터 Update
      await this.commentRepository.updateCommentPosition(
        commentId,
        position,
        queryRunner,
      );
      this.logger.verbose('Comment Position Update Complete!');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return true;
  }
}
