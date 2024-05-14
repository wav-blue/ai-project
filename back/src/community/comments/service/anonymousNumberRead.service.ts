import { Injectable } from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { QueryRunner } from 'typeorm';
import { AnonymousNumberType } from '.././enum/anonymousNumberType.enum';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';

@Injectable()
export class AnonymousNumberReadService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private logger: MyLogger,
  ) {
    this.logger.setContext(AnonymousNumberReadService.name);
  }

  // 해당 게시글, 해당 유저의 익명번호를 조회
  async readAnonymousNumber(
    boardId: number,
    userId: string,
    foundBoard: Board,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const boardWriter = foundBoard.userId;
    let anonymousNumber: number;

    // 게시글 작성자: 특수한 익명 번호 부여(0)
    if (userId === boardWriter) {
      anonymousNumber = AnonymousNumberType.WRITER;
      this.logger.log(
        `게시글 작성자가 댓글 작성함 : 익명번호 ${AnonymousNumberType.WRITER}`,
      );
      return anonymousNumber;
    }

    // 일반 작성자
    const existingAnonymousNumber =
      await this.commentRepository.getAnonymousNumber(
        boardId,
        userId,
        queryRunner,
      );
    if (existingAnonymousNumber) {
      anonymousNumber = existingAnonymousNumber + 1;
      this.logger.debug(
        `기존의 익명 번호가 존재함 : ${existingAnonymousNumber}`,
      );
    } else {
      this.createAnonymousNumber(boardId, queryRunner);
      this.logger.debug(`새로 익명 번호가 부여됨 : ${anonymousNumber}`);
    }

    return anonymousNumber;
  }

  private async createAnonymousNumber(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<number> {
    let anonymousNumber: number;

    anonymousNumber = await this.commentRepository.getNewAnonymousNumber(
      boardId,
      queryRunner,
    );

    // 조회된 내역 없음
    if (!anonymousNumber) {
      anonymousNumber = 1;
    }

    return anonymousNumber;
  }
}
