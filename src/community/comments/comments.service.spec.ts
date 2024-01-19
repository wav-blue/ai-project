import { CommentsService } from './comments.service';
import { DataSource } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';

jest.mock('./comments.repository');
import { CommentRepository } from './comments.repository';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

describe('commentService Transaction Test', () => {
  let commentsService: CommentsService;
  let commentRepository: CommentRepository;
  let dataSource: DataSource;
  let httpService: HttpService;

  // beforeAll? berforeEach?
  beforeAll(() => {
    commentsService = new CommentsService(
      commentRepository,
      dataSource,
      httpService,
    );
  });

  // comment 생성 테스트
  // async createComment(user: string, createCommentDto: CreateCommentDto) {
  describe('transaction test', () => {
    it('request success라는 응답을 전송해야 함', async () => {
      const testUser = '7238bf28-4db1-4bc2-a941-023badad9bdf';
      const testCreateCommentDto = new CreateCommentDto();
      testCreateCommentDto.boardId = 5;
      testCreateCommentDto.content = 'test Content';

      new Logger.log(
        'reqest 데이터\n testUser: ',
        testUser,
        'Dto: ',
        testCreateCommentDto,
      );

      commentsService.createComment(testUser, testCreateCommentDto);

      expect('request success');
    });
  });
});
