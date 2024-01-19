import { TestBed } from '@automock/jest';
import { CommentsService } from './comments.service';
import { CommentRepository } from './comments.repository';
import { DataSource } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('commentService Transaction Test', () => {
  let commentsService: CommentsService;
  let commentRepository: CommentRepository;
  let dataSource: DataSource;

  // beforeAll? berforeEach?
  beforeAll(() => {
    commentsService = new CommentsService(commentRepository, dataSource);
  });

  // comment 생성 테스트
  describe('transaction test', () => {
    it('should return an array of comments(for testing)', async () => {
      const createCommentDto = new CreateCommentDto();
      createCommentDto.boardId = 5; // 유효하지 않은 게시판 번호
      createCommentDto.content = 'test Content';

      commentsService.createComment('testUserA', createCommentDto);
    });
  });
});
