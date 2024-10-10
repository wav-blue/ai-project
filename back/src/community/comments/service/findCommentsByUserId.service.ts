import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Comment } from '.././entity/comments.entity';
import { MyLogger } from 'src/logger/logger.service';
import { QueryPageDto } from '../dto/queryPage.dto';
import { ReadCommentsByUserIdDto } from '../dto/readCommentsByUserId.dto';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class FindCommentsByUserIdService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(FindCommentsByUserIdService.name);
  }

  // 로그인한 유저가 작성한 Comment 조회
  async getCommentsByUserId(
    userId: string,
    queryPageDto: QueryPageDto,
  ): Promise<ReadCommentsByUserIdDto> {
    let commentList: Comment[];
    let count = 0;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      commentList = await this.commentRepository.getMyComments(
        userId,
        queryPageDto,
        queryRunner,
      );

      count = await this.commentRepository.countCommentsByUser(
        userId,
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
    return new ReadCommentsByUserIdDto({ commentList, count });
  }
}
