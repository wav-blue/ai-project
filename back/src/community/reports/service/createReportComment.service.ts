import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { CommentReportRepository } from '../repository/commentReport.repository';
import { DeleteCommentByReportService } from 'src/community/comments/service/deleteCommentByReport.service';
import { Comment } from 'src/community/comments/entity/comments.entity';
import { FindCommentService } from 'src/community/comments/service/findComment.service';
import { CreateReportCommentDto } from '../dto/createReportComment.dto';

@Injectable()
export class CreateReportCommentService {
  constructor(
    private readonly commentReportRepository: CommentReportRepository,
    private readonly findCommentService: FindCommentService,
    private readonly deleteCommentReportedService: DeleteCommentByReportService,
    private readonly dataSource: DataSource,
    private logger: MyLogger,
  ) {
    this.logger.setContext(CreateReportCommentService.name);
  }

  // 신고 내역 작성
  async createCommentReport(createReportCommentDto: CreateReportCommentDto) {
    // 변수 선언
    let foundComment: Comment;
    const reportUserList = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const { commentId, reportUserId } = createReportCommentDto;

      // 신고된 Comment의 정보 조회
      foundComment =
        await this.findCommentService.getCommentByCommentIdWithQueryRunner(
          commentId,
          queryRunner,
        );

      if (foundComment.userId === reportUserId) {
        this.logger.debug(`자신이 작성한 댓글은 신고 불가함`);
        throw new ConflictException('잘못된 신고 요청입니다.');
      }

      // 해당 댓글을 report한 유저 조회
      const checkResult = await this.commentReportRepository.checkReportUser(
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

      await this.commentReportRepository.createCommentReport(
        createReportCommentDto,
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
      return { status: 'reported' };
    } else {
      // 신고 횟수 누적으로 댓글 삭제
      this.deleteCommentReportedService.deleteCommentReported(
        createReportCommentDto.commentId,
      );
    }

    return { status: 'deleted' };
  }
}
