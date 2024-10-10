import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { QueryPageDto } from '../dto/queryPage.dto';
import { BoardsService } from 'src/community/boards/boards.service';
import { CountCommentsByBoardIdService } from './countCommentsByBoardId.service';
import { ReadCommentsByBoardIdDto } from '../dto/readCommentsByBoardId.dto';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class FindCommentsByBoardIdService {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly countCommentsByBoardIdService: CountCommentsByBoardIdService,
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(FindCommentsByBoardIdService.name);
  }

  // 해당 Board의 Comment 조회
  async getCommentsByBoardId(
    boardId: number,
    queryPageDto: QueryPageDto,
  ): Promise<ReadCommentsByBoardIdDto> {
    let results = null;
    let countResult = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      await this.boardsService.readBoardWithQueryRunner(boardId, queryRunner);

      results = await this.commentRepository.getBoardComments(
        boardId,
        queryPageDto,
        queryRunner,
      );

      countResult =
        await this.countCommentsByBoardIdService.countCommentsByBoardId(
          boardId,
          queryRunner,
        );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      } else if (err instanceof ConflictException) {
        throw new ConflictException(err.message);
      } else {
        throw new InternalServerErrorException(err.message);
      }
    } finally {
      await queryRunner.release();
    }

    return new ReadCommentsByBoardIdDto({
      commentList: results,
      ...countResult,
    });
  }
}
