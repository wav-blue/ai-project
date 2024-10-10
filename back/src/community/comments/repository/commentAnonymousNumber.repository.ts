import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { ReadNewCommentDto } from '../dto/readNewComment.dto';
import { AnonymousNumberComment } from '../entity/anonymousNumberComment.entity';

@Injectable()
export class CommentAnonymousNumberRepository {
  constructor(private logger: MyLogger) {
    this.logger.setContext(CommentAnonymousNumberRepository.name);
  }

  /** Anonymous Number Comment 테이블 데이터 생성 */
  async createAnonymousNumber(
    boardId: number,
    userId: string,
    anonymousNumber: number,
    queryRunner: QueryRunner,
  ): Promise<ReadNewCommentDto> {
    const newComment = queryRunner.manager.create(AnonymousNumberComment, {
      boardId,
      userId,
      anonymousNumber,
      deletedAt: null,
    });

    const result = await queryRunner.manager.save(newComment);
    return new ReadNewCommentDto(result);
  }
}
