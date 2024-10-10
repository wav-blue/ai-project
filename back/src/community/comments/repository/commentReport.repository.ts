import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { MyLogger } from 'src/logger/logger.service';
import { CommentReport } from '../entity/reportComment.entity';
import { CreateCommentReportDto } from '../dto/createCommentReport.dto';

@Injectable()
export class CommentReportRepository {
  constructor(private logger: MyLogger) {
    this.logger.setContext(CommentReportRepository.name);
  }

  /** 특정 Comment의 신고 유저 목록 조회 */
  async checkReportUser(
    commentId: number,
    queryRunner: QueryRunner,
  ): Promise<{ report_user_id: string }[]> {
    return await queryRunner.manager
      .createQueryBuilder()
      .select('report.report_user_id')
      .from(CommentReport, 'report')
      .where('report.commentId = :commentId', {
        commentId,
      })
      .getRawMany();
  }

  /** Comment Report 테이블 데이터 추가 */
  async createCommentReport(
    createCommentReportDto: CreateCommentReportDto,
    queryRunner: QueryRunner,
  ): Promise<CommentReport> {
    const newReport = queryRunner.manager.create(CommentReport, {
      ...createCommentReportDto,
    });

    const result = await queryRunner.manager.save(newReport);
    return result;
  }
}
