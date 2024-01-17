import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DataSource } from 'typeorm';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getAllComments(): Promise<Comment[]> {
    const found = this.commentRepository.getAllComments();
    return found;
  }

  async getBoardComments(boardId: number, page: number): Promise<Comment[]> {
    const check = await this.commentRepository.checkBoardNull();
    if (!check) {
      throw new NotFoundException('Not FOund!!');
    }
    const found = this.commentRepository.getBoardComments(boardId);
    return found;
  }

  async createComment(user: string, createCommentDto: CreateCommentDto) {
    // create a new query runner
    const queryRunner = this.dataSource.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();
    console.log('queryRunner 시도');
    try {
      console.log('실험용으로 댓글 1개 추가');
      await this.commentRepository.createComment(
        user,
        createCommentDto,
        queryRunner,
      );

      // console.log('board_id로 Board가 존재하는지 확인');
      //   const found = await this.commentRepository.checkBoard(
      //     createCommentDto.boardId,
      //     queryRunner,
      //   );

      // < 테스트용!! >
      // checkBoardNull => 무조건 null을 반환
      // 주석 풀어두면 동작이 제대로 Rollback되는지 확인 가능
      //   const found = await this.commentRepository.checkBoardNull();
      //   console.log('found 값: ', found);

      //   if (!found) {
      //     console.log('NotFoundException 발생!!');
      //     throw new NotFoundException('Not Found!!');
      //   }

      console.log('실험용으로 댓글 1개 더 추가');
      // execute some operations on this transaction:
      await this.commentRepository.createComment(
        'copyUser123',
        createCommentDto,
        queryRunner,
      );

      console.log('createComment 완료');

      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log('error catch!!');
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw new NotFoundException();
    } finally {
      // you need to release query runner which is manually created:
      console.log('finally!!');
      await queryRunner.release();
    }

    return 'complete';
  }

  async createCommentReport(createCommentReportDto: CreateCommentReportDto) {
    const { commentId } = createCommentReportDto;
    // create a new query runner
    const queryRunner = this.dataSource.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();
    console.log('queryRunner 시도');
    try {
      //const found = await this.commentRepository.findComment(commentId);
      const found = null;
      if (!found) {
        // deleted 상태이거나 데이터베이스에서 찾을 수 없는 댓글
        console.log('에러 실행');
        throw new NotFoundException('이미 삭제된 댓글');
      }
      await this.commentRepository.createCommentReport(
        createCommentReportDto,
        queryRunner,
      );

      console.log('createComment 완료');

      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log('error catch!!');
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw new NotFoundException();
    } finally {
      // you need to release query runner which is manually created:
      console.log('finally!!');
      await queryRunner.release();
    }

    return 'complete';
  }

  async deleteComment(user, commentId: number) {
    const result = this.commentRepository.deleteComment(user, commentId);
    return result;
  }
}
