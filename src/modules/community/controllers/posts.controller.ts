import { Controller, Get } from '@nestjs/common';
import { PostsService } from '../services/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private communityService: PostsService) {}

  @Get()
  getList() {
    return this.communityService.getPostsList;
  }
}
