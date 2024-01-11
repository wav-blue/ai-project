import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post as HttpPost,
  Put,
  UsePipes,
  ValidationPipe,
  Req,
  Headers,
} from '@nestjs/common';
import { PostsService } from '../services/posts.service';
import { Post } from '../entities/posts.entity';
import { PostsDto } from '../dtos/posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getPostsList(): Promise<Post[]> {
    return this.postsService.getPostsList();
  }

  @HttpPost()
  @UsePipes(ValidationPipe)
  createPost(
    @Headers(),
    @Body() postsDto: PostsDto,
  ): Promise<Post> {
    const user_id: string = request.cookie['userId'];
    return this.postsService.createPost(postsDto);
  }

  @Get('/id')
  getPostById(@Param('id') id: string): Promise<Post> {
    return this.postsService.getPostById(id);
  }

  @Delete('/id')
  deletePost(@Param('id') id: string): Promise<void> {
    this.postsService.deletePost(id);
  }

  @Put('/id')
  @UsePipes(ValidationPipe)
  updatePost(
    @Param('id') id: string,
    @Body() postsDto: PostsDto,
  ): Promise<Post> {
    return this.postsService.updatePost(id, postsDto);
  }
}
