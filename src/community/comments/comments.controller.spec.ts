import { CommentsController } from './comments.controller';
import { CommentRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('commentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;
  let commentRepository: CommentRepository;

  beforeEach(() => {
    commentsService = new CommentsService(commentRepository);
    commentsController = new CommentsController(commentsService);
  });

  // 댓글 조회 테스트
  describe('findAllComments', () => {
    it('should return an array of comments(for testing)', async () => {
      const result = [];
      jest
        .spyOn(commentsService, 'getAllComments')
        .mockImplementation(async () => result);

      expect(await commentsController.getAllComments()).toBe(result);
    });
  });

  // 해당 게시글 번호의 댓글 조회 테스트
  describe('findBoardComments', () => {
    it('should return an array of comments of board', async () => {
      const result = [];
      jest
        .spyOn(commentsService, 'getBoardComments')
        .mockImplementation(async () => result);

      expect(await commentsController.getBoardComments(3)).toBe(result);
    });
  });

  // 작성 중인 테스트 (동작 X)
  describe('createComment', () => {
    it('shoud return created comment', async () => {
      const user = 'testUser123';
      const createCommentDto = new CreateCommentDto();
      createCommentDto.boardId = 2;
      createCommentDto.content = '테스트용 컨텐츠';

      const result = await commentsController.createComment(
        user,
        createCommentDto,
      );

      console.log('데이터베이스 추가 후 값 확인');
      console.log(result);
    });
  });
});
