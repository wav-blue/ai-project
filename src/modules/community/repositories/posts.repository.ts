import connectDB from 'src/configs/typeorm.config';
import { Post } from '../entities/posts.entity';

export const PostRepository = connectDB.getRepository(Post).extend({
  selectPostsList() {
    return this.createQueryBuilder('Post').where();
  },
  async insertPost(
    user_id: string,
    title: string,
    content: string,
    created_at: Date,
  ) {
    try {
      return await this.createQueryBuilder('Post')
        .insert()
        .into(Post)
        .values([{ user_id, title, content, created_at }])
        .execute();
    } catch (err) {}
  },
});
