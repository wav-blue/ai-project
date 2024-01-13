import { Injectable } from '@nestjs/common';
import { DataSource, QueryBuilder } from 'typeorm';
import { Board } from './boards.entity';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Injectable()
export class BoardsRepository {
  private queryBuilder: QueryBuilder<Board>;
  constructor(private readonly datasource: DataSource) {
    this.queryBuilder = this.datasource.createQueryBuilder();
  }

  //게시판 페이지 목록 넘버링 필요한가??

  //게시판 목록
  async selectAllBoards(previous: number, show: number): Promise<Board[]> {
    try {
      const result = await this.queryBuilder
        .select(['boardId', 'title', 'views', 'createdAt', 'updatedAt'])
        .from(Board, 'board')
        .where('board.status= :status', { status: 'nomal' })
        .orderBy('board.createdAt', 'DESC')
        .skip(previous)
        .take(show)
        .getMany();

      return result;
    } catch (err) {
      console.error('게시판 목록을 긁어오던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시판 목록 읽기 실패');
    }
  }

  //검색
  async selectBoardsBySearch(
    keyword: string,
    previous: number,
    show: number,
  ): Promise<Board[]> {
    try {
      const result = await this.queryBuilder
        .select(['boardId', 'title', 'views', 'createdAt', 'updatedAt'])
        .from(Board, 'board')
        .where('board.status= :status', { status: 'nomal' })
        .andWhere('board.title LIKE :keyword OR board.content LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orderBy('board.createdAt', 'DESC')
        .skip(previous)
        .take(show)
        .getMany();
      return result;
    } catch (err) {
      console.error('게시판 목록을 긁어오던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시판 목록 읽기 실패');
    }
  }

  //게시글 읽기
  async selectBoard(boardId: number): Promise<Board> {
    try {
      const result = await this.queryBuilder
        .select('*')
        .from(Board, 'board')
        .where('board.boardId = :boardId', { boardId })
        .getOneOrFail();

      return result;
    } catch (err) {
      console.error('게시물 가져오던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 읽기 실패');
    }
  }

  //조회수 카운팅
  //자기가 작성한 게시글 조회수 올리나?
  async updateView(boardId: number): Promise<Board> {
    try {
      const result = await this.queryBuilder
        .update(Board)
        .set({ views: () => 'views + 1' })
        .where('board.boardId = :boardId', { boardId })
        .execute();
      return result.raw;
    } catch (err) {
      console.error('게시물 조회수 수정 중 뭔가 잘못됨:', err.message);
      throw new Error('조회수 변경 실패');
    }
  }

  //게시글 작성
  //이미지 url 테이블 따로 생성
  //createdAt 자동으로 들어가는지 확인
  async insertBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      const result = await this.queryBuilder
        .insert()
        .into(Board)
        .values(createBoardDto)
        .execute();

      return result.raw;
    } catch (err) {
      console.error('게시물 저장 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 저장 실패');
    }
  }

  //게시글 유저 확인
  //유저 확인 먼저 하고 수정/삭제 거절해버리는게 맞는지?
  //아님 그냥 update 쿼리 내에서 where('board.userId = :userId', { userId }) 로 처리해버리는게 맞는지?
  async selectWriter(boardId: number): Promise<Board> {
    try {
      const result = await this.queryBuilder
        .select('userId')
        .from(Board, 'board')
        .where('board.boardId = :boardId', { boardId })
        .getOneOrFail();

      return result;
    } catch (err) {
      console.error('게시물 작성자 확인 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 작성자 확인 실패');
    }
  }
  //게시글 수정
  async updateBoard(updateBoardDto: UpdateBoardDto): Promise<Board> {
    try {
      const { boardId, title, content } = updateBoardDto;
      const result = await this.queryBuilder
        .update(Board)
        .set({ title, content, updatedAt: new Date() })
        .where('board.boardId = :boardId', { boardId })
        .execute();

      return result.raw;
    } catch (err) {
      console.error('게시물 수정 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 수정 실패');
    }
  }

  //게시글 삭제
  //softdelete?
  //삭제 성공하면 리디렉트 시키고, 삭제 페이지는 삭제로 보여야 함.
  async softDeleteBoard(boardId: number): Promise<Board> {
    try {
      const result = await this.queryBuilder
        .update(Board)
        .set({ status: 'deleted', deletedAt: new Date() })
        .where('board.boardId = :boardId', { boardId })
        .execute();

      return result.raw;
    } catch (err) {
      console.error('게시물 삭제 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 삭제 실패');
    }
  }
}
