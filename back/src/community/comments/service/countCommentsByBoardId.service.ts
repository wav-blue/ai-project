import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { QueryRunner } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';

@Injectable()
export class CountCommentsByBoardIdService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CountCommentsByBoardIdService.name);
  }

  async countCommentsByBoardId(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<{
    count: number;
    positiveCount: number;
    negativeCount: number;
  }> {
    const count = await this.commentRepository.countCommentByBoardId(
      boardId,
      queryRunner,
    );

    const positiveCount =
      await this.commentRepository.countCommentByBoardIdAndPositive(
        boardId,
        queryRunner,
      );

    return {
      count,
      positiveCount,
      negativeCount: count - positiveCount,
    };
  }
}
