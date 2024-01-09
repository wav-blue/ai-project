import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  private posts = [];

  getPostsList() {
    return this.posts;
  }
}
