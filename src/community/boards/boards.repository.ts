import { Injectable } from '@nestjs/common';
import { DataSource, QueryBuilder } from 'typeorm';
import { Board } from './boards.entity';

@Injectable()
export class BoardsRepository {
  private queryBuilder: QueryBuilder<Board>;
  constructor(private readonly datasource: DataSource) {
    this.queryBuilder = this.datasource.createQueryBuilder();
  }

  async selectAllBoards(
    title: string,
    views: number,
    created_at: Date,
    updated_at: Date,
  ) {
    try {
      const result = await this.queryBuilder
        .select('title', 'views', 'createdAt', 'updatedAt')
        .from(Board)
        .where();
    } catch (err) {}
  }

  async insertBoard(
    user_id: string,
    title: string,
    content: string,
    created_at: Date,
  ) {
    try {
      const result = await this.queryBuilder
        .insert()
        .into(Board)
        .values([{ user_id, title, content, created_at }])
        .execute();

      return result;
    } catch (err) {
      console.error('게시물 저장 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 저장 실패');
    }
  }
}
