import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { BoardsService } from 'src/community/boards/boards.service';

@Injectable()
export class CountCommentsByBoardId {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CountCommentsByBoardId.name);
  }

  // 해당 Board의 Counting 조회
  async countCommentsByBoardId(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<{
    positiveCount: number;
    negativeCount: number;
  }> {
    // Group By 이용
    const countResult =
      await this.commentRepository.countCommentGroupByPositionByBoardId(
        boardId,
        queryRunner,
      );

    return countResult;
  }
}
