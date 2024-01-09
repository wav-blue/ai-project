import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '../entities/posts.entity';
import { PostsDto } from '../dtos/posts.dto';
import { PostRepository } from '../repositories/posts.repository';

@Injectable()
export class PostsService {
  async getPostsList(): Promise<Post[]> {
    return await PostRepository.selectPostsList(); //repository에서 select 쿼리 작성
  }

  async createPost(postsDto: PostsDto): Promise<Post> {
    const { user_id, title, content } = postsDto;
    const created_at = new Date();
    return await PostRepository.insertPost(user_id, title, content, created_at); //repository에서 insert into 쿼리 작성
  }

  async getPostById(id: string): Promise<Post> {
    const post = await PostRepository.selectPost(id); //id 사용해서 찾는 쿼리를 repository에 작성, 조회수 업데이트
    if (!post) {
      throw new NotFoundException(`${id}번 게시글을 찾지 못함`);
    }
    return post;
  }

  async deletePost(id: string): Promise<void> {
    const post = await PostRepository.getPostById(id);
    if (!post) {
      throw new NotFoundException(`${id}번 게시글을 찾지 못함`);
    }
    await PostRepository.deletePost(id); //id 사용해 삭제하는 쿼리 repository에 작성
  }

  async updatePost(id: string, postsDto: PostsDto): Promise<Post> {
    const post = await PostRepository.getPostById(id);
    if (!post) {
      throw new NotFoundException(`${id}번 게시글을 찾지 못함`);
    }
    const { user_id, title, content } = postsDto;
    const updated_at = new Date();
    return PostRepository.updatePost(user_id, title, content, updated_at); //repository에서 수정하는 쿼리 작성
  }
}
