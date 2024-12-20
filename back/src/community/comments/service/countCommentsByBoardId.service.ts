import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { CommentRepository } from '../repository/comments.repository';
import { CommentPosition } from '../enum/commentPosition.enum';

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
    const result = await this.commentRepository.countCommentByBoardId(
      boardId,
      queryRunner,
    );

    let positiveCount = 0;
    let negativeCount = 0;
    let loadingCommentCount = 0;

    for (let i = 0; i < result.length; i++) {
      if (result[i].position === CommentPosition.POSITIVE)
        positiveCount = result[i]['COUNT(1)'];
      if (result[i].position === CommentPosition.NEGATIVE)
        negativeCount = result[i]['COUNT(1)'];
      if (result[i].position === CommentPosition.LOADING)
        loadingCommentCount = result[i]['COUNT(1)'];
    }

    const count = positiveCount + negativeCount + loadingCommentCount;

    return {
      count,
      positiveCount: positiveCount,
      negativeCount: negativeCount,
    };
  }
}
