import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/user/guards/local-service.guard';
import { CreateReportCommentService } from './service/createReportComment.service';
import { MyLogger } from 'src/logger/logger.service';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { CreateReportCommentDto } from './dto/createReportComment.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private createReportWithCommentService: CreateReportCommentService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(ReportsController.name);
  }

  // 신고 내역 추가 (신고 누적 상황에 따라 해당 댓글 삭제)
  @Post('/comment')
  @UseGuards(LocalAuthGuard)
  createCommentReport(
    @GetUser() reportUserId: string,
    @Body() createReportCommentDto: CreateReportCommentDto,
  ): Promise<{ status: string }> {
    this.logger.debug(
      `${createReportCommentDto.commentId}번 댓글에 대한 신고 접수`,
    );

    createReportCommentDto.reportUserId = reportUserId;

    const result = this.createReportWithCommentService.createCommentReport(
      createReportCommentDto,
    );
    return result;
  }
}
