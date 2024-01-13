import { CommentsController } from './comments.controller';
import { CommentRepository } from './comments.repository';
import { CommentsService } from './comments.service';

describe('commentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;
  let commentRepository: CommentRepository;

  beforeEach(() => {
    commentsService = new CommentsService(commentRepository);
    commentsController = new CommentsController(commentsService);
  });

  describe('findAllComments', () => {
    it('should return an array of comments(for testing)', async () => {
      const result = [];
      jest
        .spyOn(commentsService, 'getAllComments')
        .mockImplementation(async () => result);

      expect(await commentsController.getAllComments()).toBe(result);
    });
  });

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