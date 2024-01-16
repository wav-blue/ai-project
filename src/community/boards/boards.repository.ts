import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Board } from './boards.entity';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Injectable()
export class BoardsRepository {
  //생성자 필요???

  //게시판 목록
  async countAllBoards(queryRunner: QueryRunner): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select('COUNT(B.boardId) AS count')
        .where('B.status= :status', { status: 'normal' })
        .getRawOne();
      return result.count;
    } catch (err) {
      console.error('게시판 목록 카운팅 중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 카운팅 실패');
    }
  }

  //커버링 인덱스 페이지네이션으로 수정 필요??(typeorm skip, take는 limit offset이 아님??)
  //게시글 수 계산 + 가져오기 + 페이지네이션?? 어떤 순서??
  //페이지네이션은 ts코드로 하나??
  async selectAllBoards(
    previous: number,
    show: number,
    queryRunner: QueryRunner,
  ): Promise<Board[]> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.views',
          'B.createdAt',
          'B.updatedAt',
        ])
        .where('B.status= :status', { status: 'normal' })
        .orderBy('B.createdAt', 'DESC')
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
  //게시판 페이지 목록 총 몇페이지인지 계산하는거 필요한가?
  //한 쿼리에서 갯수 계산 vs 갯수 계산 쿼리 따로 만들기?
  //게시글 수 계산 + 가져오기 + 페이지네이션?? 어떤 순서??
  async countBoardsBySearch(
    keyword: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select('COUNT(B.boardId) AS count')
        .where('B.status= :status', { status: 'nomal' })
        .andWhere('B.title LIKE :keyword OR B.content LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .getRawOne();
      return result.count;
    } catch (err) {
      console.error('게시글 검색 카운팅 중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 검색 카운팅 실패');
    }
  }
  async selectBoardsBySearch(
    keyword: string,
    previous: number,
    show: number,
    queryRunner: QueryRunner,
  ): Promise<Board[]> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.views',
          'B.createdAt',
          'B.updatedAt',
        ])
        .where('B.status= :status', { status: 'nomal' })
        .andWhere('B.title LIKE :keyword OR B.content LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orderBy('createdAt', 'DESC')
        .skip(previous)
        .take(show)
        .getMany();
      return result;
    } catch (err) {
      console.error('게시글 검색하던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 검색 실패');
    }
  }

  //특정 유저의 게시글 가져오기
  //삭제 신고도 보여줌
  async countUserBoards(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select('COUNT(B.boardId) AS count')
        .where('B.userId= :userId', { userId })
        .getRawOne();
      return result.count;
    } catch (err) {
      console.error(`${userId}의 게시물 카운팅 중 뭔가 잘못됨:`, err.message);
      throw new Error(`${userId}의 게시물 카운팅 실패`);
    }
  }
  async selectUserBoards(
    userId: string,
    previous: number,
    show: number,
    queryRunner: QueryRunner,
  ): Promise<Board[]> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.views',
          'B.status',
          'B.createdAt',
          'B.updatedAt',
        ])
        .where('B.userId= :userId', { userId })
        .orderBy('B.createdAt', 'DESC')
        .skip(previous)
        .take(show)
        .getMany();
      return result;
    } catch (err) {
      console.error(`${userId}의 게시물 가져오던 중 뭔가 잘못됨:`, err.message);
      throw new Error(`${userId}의게시물 읽기 실패`);
    }
  }

  //게시글 읽기
  async selectBoard(boardId: number, queryRunner: QueryRunner): Promise<Board> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .where('B.boardId = :boardId', { boardId })
        .getOneOrFail();

      return result;
    } catch (err) {
      console.error('게시물 가져오던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 읽기 실패');
    }
  }

  //조회수 카운팅
  //자기가 작성한 게시글 조회수 올리나?
  async updateView(boardId: number, queryRunner: QueryRunner): Promise<Board> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Board)
        .set({ views: () => 'views + 1' })
        .where('boardId = :boardId', { boardId })
        .execute();
      console.log(result);
      return result.raw;
    } catch (err) {
      console.error('게시물 조회수 수정 중 뭔가 잘못됨:', err.message);
      throw new Error('조회수 변경 실패');
    }
  }

  //게시글 유저 확인
  async selectWriter(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<Board> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select(['B.boardId', 'B.userId'])
        .where('B.boardId = :boardId', { boardId })
        .getOneOrFail();
      console.log(result);

      return result;
    } catch (err) {
      console.error('게시물 작성자 확인 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 작성자 확인 실패');
    }
  }

  //게시글 작성
  //createdAt 이 자동으로 들어가지 않는 문제 발생중!!!
  //이미지 url 테이블 따로 생성
  //createdAt 자동으로 들어가는지 확인
  async insertBoard(
    createBoardDto: CreateBoardDto,
    queryRunner: QueryRunner,
  ): Promise<Board> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
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
  //게시글 수정
  async updateBoard(
    updateBoardDto: UpdateBoardDto,
    queryRunner: QueryRunner,
  ): Promise<Board> {
    try {
      const { boardId, title, content } = updateBoardDto;
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Board)
        .set({ title, content, updatedAt: new Date() })
        .where('boardId = :boardId', { boardId })
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
  async softDeleteBoard(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<Board> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Board)
        .set({ status: 'deleted', deletedAt: new Date() })
        .where('boardId = :boardId', { boardId })
        .execute();

      return result.raw;
    } catch (err) {
      console.error('게시물 삭제 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 삭제 실패');
    }
  }
}
