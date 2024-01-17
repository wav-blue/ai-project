import { DataSource } from 'typeorm';
import { CommentsController } from './comments.controller';
import { CommentRepository } from './comments.repository';
import { CommentsService } from './comments.service';

describe('commentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;
  let commentRepository: CommentRepository;
  let dataSource: DataSource;

  beforeEach(() => {
    commentsService = new CommentsService(commentRepository, dataSource);
    commentsController = new CommentsController(commentsService);
  });

  // 모든 댓글 조회 테스트
  describe('findAllComments', () => {
    it('should return an array of comments(for testing)', async () => {
      const result = [];
      jest
        .spyOn(commentsService, 'getAllComments')
        .mockImplementation(async () => result);

      expect(await commentsController.getAllComments()).toBe(result);
    });
  });

  // 포스트의 댓글 조회 테스트
  describe('findBoardComments', () => {
    it('should return an array of comments of board', async () => {
      const result = [];
      jest
        .spyOn(commentsService, 'getBoardComments')
        .mockImplementation(async () => result);

      expect(await commentsController.getBoardComments(3)).toBe(result);
    });
  });
});
