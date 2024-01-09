import { Controller, Get } from '@nestjs/common';
import { PostsService } from '../services/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getList() {
    return this.postsService.getPostsList;
  }
}
