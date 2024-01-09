import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from '../services/posts.service';
import { Post } from '../entities/posts.entity';
import { PostsDto } from '../dtos/posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getPostsList() {
    return this.postsService.getPostsList();
  }

  @Post()
  @UsePipes(ValidationPipe)
  createPost(@Body() postsDto: PostsDto): Post {
    //user_id는 헤더의 쿠키에서 가져오는데...어케 작성하는겨 Dto 에는 어케 넣는겨
    return this.postsService.createPost(postsDto);
  }

  @Get('/id')
  getPostById(@Param('id') id: string): Post {
    return this.postsService.getPostById(id);
  }

  @Delete('/id')
  deletePost(@Param('id') id: string): void {
    this.postsService.deletePost(id);
  }

  @Put('/id')
  @UsePipes(ValidationPipe)
  updatePost(@Param('id') id: string, @Body() postsDto: PostsDto): Post {
    return this.postsService.updatePost(id, postsDto);
  }
}
