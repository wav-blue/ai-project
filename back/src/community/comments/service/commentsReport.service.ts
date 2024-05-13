import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CommentRepository } from '.././comments.repository';
import { DataSource } from 'typeorm';
import { CreateCommentReportDto } from '.././dto/createCommentReport.dto';
import { CommentStatus } from '.././enum/commentStatus.enum';
import { Comment } from '.././entity/comments.entity';
import { CommentPosition } from '.././enum/commentPosition.enum';
import { MyLogger } from 'src/logger/logger.service';
import { setTimeColumn } from '../util/commentData.util';

@Injectable()
export class CommentsReportService {
  private checkAffectedDB(queryAffected: number) {
    if (queryAffected === 0) {
      this.logger.error('DB에서 업데이트 된 내용이 존재하지 않습니다.');
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 요청을 완료하지 못했습니다.',
      );
    }
  }

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CommentsReportService.name);
  }

  // 신고 내역 작성 && 신고 누적 시 삭제
  async createCommentReport(createCommentReportDto: CreateCommentReportDto) {
    // DTO 설정
    createCommentReportDto = setTimeColumn(createCommentReportDto);

    // 변수 선언
    let foundComment: Comment;
    let commentStatus = CommentStatus.NOT_DELETED;
    const reportUserList = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const { commentId, reportUserId } = createCommentReportDto;

      // 신고된 Comment의 정보 조회
      foundComment = await this.commentRepository.checkComment(
        commentId,
        queryRunner,
      );
      if (!foundComment || foundComment.status !== CommentStatus.NOT_DELETED) {
        if (!foundComment) {
          this.logger.error(`해당하는 댓글의 정보가 데이터베이스 내에 없음`);
        } else {
          this.logger.error(
            `댓글의 상태가 ${foundComment.status}이므로 신고할 수 없음`,
          );
        }
        throw new NotFoundException('이미 삭제된 댓글입니다.');
      }

      if (foundComment.userId === reportUserId) {
        this.logger.warn(
          `자신의 댓글은 신고할 수 없습니다! 개발 편의를 위해 에러를 주석 처리`,
        );
        //   throw new ConflictException('잘못된 신고 요청입니다.');
      }

      // 댓글 작성자의 id 저장
      createCommentReportDto.targetUserId = foundComment.userId;

      // 해당 댓글을 report한 User들의 기록을 조회
      const checkResult = await this.commentRepository.checkReportUser(
        commentId,
        queryRunner,
      );

      // 동일 인물이 하나의 댓글에 대해 중복 신고
      for (let i = 0; i < checkResult.length; i++) {
        if (checkResult[i].report_user_id !== reportUserId) {
          reportUserList.push(checkResult[i].report_user_id);
        } else {
          throw new ConflictException('이미 신고된 댓글입니다.');
        }
      }

      reportUserList.push(reportUserId);

      await this.commentRepository.createCommentReport(
        createCommentReportDto,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    if (reportUserList.length < 5) {
      return { status: commentStatus };
    }

    const QueryRunnerForDelete = this.dataSource.createQueryRunner();
    await QueryRunnerForDelete.connect();

    await QueryRunnerForDelete.startTransaction();

    try {
      // 일정 횟수 신고되어 댓글 삭제
      this.logger.verbose(
        `${reportUserList.length}회 신고되어 댓글 ${CommentStatus.REPORTED} 상태로 변경됨`,
      );
      const { targetUserId, commentId } = createCommentReportDto;
      commentStatus = CommentStatus.REPORTED;

      const updateCommentResult = await this.commentRepository.deleteComment(
        targetUserId,
        commentId,
        commentStatus,
        queryRunner,
      );

      // 변경된 내용이 없는 경우
      this.checkAffectedDB(updateCommentResult.affected);

      // 긍부정 댓글 카운팅 -1
      const { boardId, position } = foundComment;

      const foundCountPosition = await this.commentRepository.checkCommentCount(
        boardId,
        QueryRunnerForDelete,
      );

      this.logger.debug(`댓글이 신고되어 ${position}Count 감소`);
      if (position === CommentPosition.POSITIVE)
        foundCountPosition.positiveCount -= 1;
      if (position === CommentPosition.NEGATIVE)
        foundCountPosition.negativeCount -= 1;
      const updateCountResult = await this.commentRepository.updateCommentCount(
        boardId,
        foundCountPosition,
        QueryRunnerForDelete,
      );

      // 변경된 내용이 없는 경우
      this.checkAffectedDB(updateCountResult.affected);

      await QueryRunnerForDelete.commitTransaction();
    } catch (err) {
      await QueryRunnerForDelete.rollbackTransaction();
      throw err;
    } finally {
      await QueryRunnerForDelete.release();
    }

    return { status: commentStatus };
  }
}
