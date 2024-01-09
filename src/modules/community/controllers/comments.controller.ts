import { Controller } from '@nestjs/common';
import { CommentsService } from '../services/comments.service';

@Controller('posts')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}
}
