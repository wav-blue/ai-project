import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { AnonymousNumberType } from '.././enum/anonymousNumberType.enum';
import { Board } from 'src/community/boards/boards.entity';
import { MyLogger } from 'src/logger/logger.service';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class FindAnonymousNumberService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private logger: MyLogger,
  ) {
    this.logger.setContext(FindAnonymousNumberService.name);
  }

  // 해당 게시글, 해당 유저의 익명번호를 조회
  async readAnonymousNumber(
    boardId: number,
    userId: string,
    foundBoard: Board,
    queryRunner: QueryRunner,
  ): Promise<number> {
    const boardWriter = foundBoard.userId;
    let anonymousNumber = -1;

    // 익명 번호 테이블 조회
    const existingAnonymousNumber =
      await this.commentRepository.getAnonymousNumber(
        boardId,
        userId,
        queryRunner,
      );

    this.logger.info(existingAnonymousNumber);

    if (existingAnonymousNumber !== -1) {
      anonymousNumber = existingAnonymousNumber + 1;
      this.logger.debug(
        `기존의 익명 번호가 존재함 : ${existingAnonymousNumber}`,
      );
      return anonymousNumber;
    } else {
      // 게시글 작성자: 특수한 익명 번호 부여(0)
      if (userId === boardWriter) {
        anonymousNumber = AnonymousNumberType.WRITER;
        this.logger.log(
          `게시글 작성자가 댓글 작성함 : 익명번호 ${AnonymousNumberType.WRITER}`,
        );
      } else {
        // 일반 사용자
        // 익명 번호 계산
        await this.calAnonymousNumber(boardId, queryRunner);
        this.logger.debug(`새로 익명 번호가 부여됨 : ${anonymousNumber}`);
      }
    }

    return anonymousNumber;
  }

  private async calAnonymousNumber(
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
