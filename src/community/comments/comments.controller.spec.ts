import { DataSource } from 'typeorm';
import { CommentsController } from './comments.controller';
import { CommentRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { HttpService } from '@nestjs/axios';

// 작동 안함
describe('commentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;
  let commentRepository: CommentRepository;
  let dataSource: DataSource;
  let httpService: HttpService;

  beforeEach(() => {
    commentsService = new CommentsService(
      commentRepository,
      dataSource,
      httpService,
    );
    commentsController = new CommentsController(commentsService);
  });

  // 신고내역 생성 테스트
  // 포스트의 댓글 조회 테스트
  describe('신고 내역을 성공적으로 생성!', () => {
    it('should return an array of comments of board', async () => {
      const result = 'request success';
      const testUserId = '7bc1d0d8-3127-4781-9154-35fef0402e51';
      const testBody = {
        commentId: 27,
        reportType: '의심스러운 내용입니다.',
      };
      let testCreateCommentReportDto = new CreateCommentReportDto();
      testCreateCommentReportDto = testBody;

      console.log('DTO 확인', testCreateCommentReportDto);

      expect(
        await commentsController.createCommentReport(
          testUserId,
          testCreateCommentReportDto,
        ),
      ).toBe(result);
    });
  });
});
