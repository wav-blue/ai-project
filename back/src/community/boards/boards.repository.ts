import { Injectable } from '@nestjs/common';
import { Brackets, QueryRunner } from 'typeorm';
import { Board, BoardReport } from './boards.entity';
import {
  BoardSearchAndListDto,
  CreateBoardDto,
  CreateBoardReportDto,
  UpdateBoardDto,
} from './boards.dto';

@Injectable()
export class BoardsRepository {
  //생성자 필요???

  //게시판 목록
  // //게시판 목록 카운팅
  async countAllBoards(queryRunner: QueryRunner): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select('COUNT(B.boardId) AS count')
        .getRawOne();
      return parseInt(result.count);
    } catch (err) {
      console.error('게시판 목록 카운팅 중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 카운팅 실패');
    }
  }
  // //게시판 목록 페이지네이션
  async selectAllBoards(
    boardsDto: BoardSearchAndListDto,
    offset: number,
  ): Promise<Board[]> {
    const { limit, queryRunner } = boardsDto;
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.tag',
          'B.views',
          'B.createdAt',
          'B.updatedAt',
        ])
        .orderBy('B.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .getMany();

      return result;
    } catch (err) {
      console.error('게시판 목록을 긁어오던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시판 목록 읽기 실패');
    }
  }

  //태그(카테고리)별 게시글 목록
  // //태그별 목록 카운팅
  async countBoardsByTag(
    tag: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select('COUNT(B.boardId) AS count')
        .where('B.tag = :tag', { tag })
        .getRawOne();
      return parseInt(result.count);
    } catch (err) {
      console.error('게시판 태그별 카운팅 중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 태그별 카운팅 실패');
    }
  }
  // //태그별 목록 페이지네이션
  async selectBoardsByTag(
    boardsDto: BoardSearchAndListDto,
    offset: number,
  ): Promise<Board[]> {
    const { tag, limit, queryRunner } = boardsDto;
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.tag',
          'B.views',
          'B.createdAt',
          'B.updatedAt',
        ])
        .where('B.tag = :tag', { tag })
        .orderBy('B.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .getMany();
      return result;
    } catch (err) {
      console.error('게시판 태그별 리스팅중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 태그별 목록 읽기 실패');
    }
  }

  //태그(카테고리)별 게시글 검색
  // // 태그별 검색 카운팅
  async countBoardsByTagAndSearch(
    tag: string,
    keyword: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select('COUNT(B.boardId) AS count')
        .where('B.tag = :tag', { tag })
        .andWhere(
          new Brackets((qb) => {
            qb.where('B.title LIKE :keyword', {
              keyword: `%${keyword}%`,
            }).orWhere('B.content LIKE :keyword', { keyword: `%${keyword}%` });
          }),
        )
        .getRawOne();
      return parseInt(result.count);
    } catch (err) {
      console.error('게시판 태그별 검색 카운팅중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 태그별 검색 결과 카운팅 실패');
    }
  }
  // // 태그별 검색 페이지네이션
  async selectBoardsByTagAndSearch(
    boardsDto: BoardSearchAndListDto,
    offset: number,
  ): Promise<Board[]> {
    const { tag, keyword, limit, queryRunner } = boardsDto;
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.tag',
          'B.views',
          'B.createdAt',
          'B.updatedAt',
        ])
        .where('B.tag = :tag', { tag })
        .andWhere(
          new Brackets((qb) => {
            qb.where('B.title LIKE :keyword', {
              keyword: `%${keyword}%`,
            }).orWhere('B.content LIKE :keyword', { keyword: `%${keyword}%` });
          }),
        )
        .orderBy('B.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .getMany();
      return result;
    } catch (err) {
      console.error('게시판 태그별 검색중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 태그별 검색 결과 읽기 실패');
    }
  }

  //일반 검색
  // //일반 검색 카운팅
  async countBoardsBySearch(
    keyword: string,
    queryRunner: QueryRunner,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select('COUNT(B.boardId) AS count')
        .where('B.title LIKE :keyword OR B.content LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .getRawOne();
      return parseInt(result.count);
    } catch (err) {
      console.error('게시글 검색 카운팅 중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 검색 카운팅 실패');
    }
  }
  // //일반 검색 페이지네이션
  async selectBoardsBySearch(
    boardsDto: BoardSearchAndListDto,
    offset: number,
  ): Promise<Board[]> {
    const { keyword, limit, queryRunner } = boardsDto;
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.tag',
          'B.views',
          'B.createdAt',
          'B.updatedAt',
        ])
        .where('B.title LIKE :keyword OR B.content LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orderBy('B.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .getMany();
      return result;
    } catch (err) {
      console.error('게시글 검색하던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시글 검색 실패');
    }
  }

  //특정 유저 작성글 목록
  // //특정 유저글 카운팅
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
      return parseInt(result.count);
    } catch (err) {
      console.error(`${userId}의 게시물 카운팅 중 뭔가 잘못됨:`, err.message);
      throw new Error(`${userId}의 게시물 카운팅 실패`);
    }
  }
  // //특정 유저글 페이지네이션
  async selectUserBoards(
    userId: string,
    offset: number,
    limit: number,
    queryRunner: QueryRunner,
  ): Promise<Board[]> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .select([
          'B.boardId',
          'B.title',
          'B.tag',
          'B.views',
          'B.createdAt',
          'B.updatedAt',
        ])
        .where('B.userId= :userId', { userId })
        .orderBy('B.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .getMany();
      return result;
    } catch (err) {
      console.error(`${userId}의 게시물 가져오던 중 뭔가 잘못됨:`, err.message);
      throw new Error(`${userId}의게시물 읽기 실패`);
    }
  }

  //게시글 하나 읽기
  async selectBoard(boardId: number, queryRunner: QueryRunner): Promise<Board> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .withDeleted()
        .where('B.boardId = :boardId', { boardId })
        .getOneOrFail();

      return result;
    } catch (err) {
      console.error('게시물 가져오던 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 읽기 실패');
    }
  }

  //조회수 카운팅
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

  //게시글 작성
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

      return result.identifiers[0] as Board;
    } catch (err) {
      console.error('게시물 저장 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 저장 실패');
    }
  }

  //게시글 수정
  async updateBoard(
    updateBoardDto: UpdateBoardDto,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      const { userId, boardId, ...Dto } = updateBoardDto;
      await queryRunner.manager
        .createQueryBuilder()
        .update(Board)
        .set(Dto)
        .where('boardId = :boardId', { boardId })
        .andWhere('userId = :userId', { userId })
        .execute();
    } catch (err) {
      console.error('게시물 수정 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 수정 실패');
    }
  }

  //게시글 삭제
  async softDeleteBoard(
    userId: string,
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .update()
        .set({ status: 'deleted', deletedAt: () => 'CURRENT_TIMESTAMP' })
        .where('boardId = :boardId', { boardId })
        .andWhere('userId = :userId', { userId })
        .execute();
    } catch (err) {
      console.error('게시물 삭제 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 삭제 실패');
    }
  }

  // 게시글 상태 갱신
  // 게시글 신고 누적으로 인한 삭제
  async reportBoard(boardId: number, queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder(Board, 'B')
        .update()
        .set({ status: 'reported', deletedAt: () => 'CURRENT_TIMESTAMP' })
        .where('boardId = :boardId', { boardId })
        .execute();
    } catch (err) {
      console.error('게시물 상태 갱신 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 상태 갱신 실패');
    }
  }

  // 해당 게시물을 신고한 사람들 조회
  async checkReportUser(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<{ report_user_id: string }[]> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .select('BR.report_user_id')
        .from(BoardReport, 'BR')
        .where('BR.boardId = :boardId', {
          boardId,
        })
        .getRawMany();

      return result;
    } catch (err) {
      console.error(
        '게시판 신고 유저의 목록을 확인하던 중 뭔가 잘못됨:',
        err.message,
      );
      throw new Error('신고 유저 목록 확인 실패');
    }
  }

  async insertBoardReport(
    createBoardReportDto: CreateBoardReportDto,
    queryRunner: QueryRunner,
  ) {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(BoardReport)
        .values(createBoardReportDto)
        .execute();

      return result.identifiers[0] as BoardReport;
    } catch (err) {
      console.error('게시물 신고 내역 저장 중 뭔가 잘못됨:', err.message);
      throw new Error('게시물 신고 내역 저장 실패');
    }
  }

  //게시글 유저 확인
  // async selectWriter(
  //   boardId: number,
  //   queryRunner: QueryRunner,
  // ): Promise<Board> {
  //   try {
  //     console.log(typeof boardId, boardId);
  //     const result = await queryRunner.manager
  //       .createQueryBuilder(Board, 'B')
  //       .select('B.userId')
  //       .where('B.boardId = :boardId', { boardId })
  //       .getOneOrFail();
  //     console.log(result);
  //     return result;
  //   } catch (err) {
  //     console.error('게시물 작성자 확인 중 뭔가 잘못됨:', err.message);
  //     throw new Error('삭제된 글이거나 게시물 작성자 확인 실패');
  //   }
  // }
}
