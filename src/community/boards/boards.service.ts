import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BoardsRepository } from './boards.repository';
import { Board } from './boards.entity';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Injectable()
export class BoardsService {
  constructor(
    private dataSource: DataSource,
    private boardsRepository: BoardsRepository,
  ) {}
  //추후수정
  ////페이지 작성단위 상수로 만들어서 불러오거나 or 클라이언트에서 목록 보기 갯수 쿼리파람으로 받아오기

  //게시판 목록 읽기
  //페이지 네이션 이게 맞는지?
  //전체 컬럼 전부 긁기 전에 총 갯수 먼저 확인 => 정상적 요청이면 필요 컬럼 전체 긁으며 페이지네이션
  async listBoards(
    page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countAllBoards(queryRunner);
      console.log(count);
      if (count === 0) {
        return { count };
      } else if (Math.ceil(count / 15) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const previous = (page - 1) * 15;
      const show = previous + 15;
      const result = await this.boardsRepository.selectAllBoards(
        previous,
        show,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return { count, list: result };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //태그별 게시글 목록
  async tagBoards(
    tag: string,
    page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countBoardsByTag(
        tag,
        queryRunner,
      );
      if (count === 0) {
        return { count };
      } else if (Math.ceil(count / 15) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const previous = (page - 1) * 15;
      const show = previous + 15;

      const result = await this.boardsRepository.selectBoardsByTag(
        tag,
        previous,
        show,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return { count, list: result };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //검색
  async searchBoards(
    keyword: string,
    page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countBoardsBySearch(
        keyword,
        queryRunner,
      );
      if (count === 0) {
        return { count };
      } else if (Math.ceil(count / 15) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const previous = (page - 1) * 15;
      const show = previous + 15;

      const result = await this.boardsRepository.selectBoardsBySearch(
        keyword,
        previous,
        show,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return { count, list: result };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //태그별 목록에서 검색
  async tagAndSearchBoards(
    tag: string,
    keyword: string,
    page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countBoardsByTagAndSearch(
        tag,
        keyword,
        queryRunner,
      );
      if (count === 0) {
        return { count };
      } else if (Math.ceil(count / 15) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const previous = (page - 1) * 15;
      const show = previous + 15;

      const result = await this.boardsRepository.selectBoardsByTagAndSearch(
        tag,
        keyword,
        previous,
        show,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return { count, list: result };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //유저 작성글 목록
  async listUserBoards(
    userId: string,
    page: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countUserBoards(
        userId,
        queryRunner,
      );
      if (count === 0) {
        return { count };
      } else if (Math.ceil(count / 15) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const previous = (page - 1) * 15;
      const show = previous + 15;
      const result = await this.boardsRepository.selectUserBoards(
        userId,
        previous,
        show,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return { count, list: result };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //읽기 전 먼저 view 카운트 처리
  //비회원 가능 서비스이므로 본인작성 글도 그냥 조회수 올라가게 처리
  //스테이터스 먼저 가져가서 읽기 처리. 삭제나 신고된상태면 status만 전송, 노말일 경우 전체 읽어오기
  //이미지 보드에서 이미지들도 가져오기?
  //with delete 적용해야함
  async readBoard(boardId: number): Promise<Board> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await this.boardsRepository.selectBoard(
        boardId,
        queryRunner,
      );

      const { status, deletedAt, ...normalBoard } = result;
      if (result.status !== 'normal') {
        return { status, deletedAt } as Board;
      }
      await this.boardsRepository.updateView(boardId, queryRunner); //조회수 올림
      normalBoard.views += 1; //이미 가져왔던 결과에 조회수 1 반영.
      await queryRunner.commitTransaction();
      return normalBoard as Board;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //게시글 작성
  async writeBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await this.boardsRepository.insertBoard(
        createBoardDto,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //게시글 수정
  //삭제된 글인지 먼저 확인하기!!!
  async editBoard(
    userId: string,
    updateboardDto: UpdateBoardDto,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const wirterCheck = await this.boardsRepository.selectWriter(
        updateboardDto.boardId,
        queryRunner,
      );
      if (userId !== wirterCheck.userId) {
        throw new Error('작성자가 아님');
      }
      await this.boardsRepository.updateBoard(updateboardDto, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //게시글 삭제
  //이미 삭제된 글인지 먼저 확인!!!!
  async eraseBoard(userId: string, boardId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const wirterCheck = await this.boardsRepository.selectWriter(
        boardId,
        queryRunner,
      );
      if (userId !== wirterCheck.userId) {
        throw new Error('작성자가 아님');
      }
      await this.boardsRepository.softDeleteBoard(boardId, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
