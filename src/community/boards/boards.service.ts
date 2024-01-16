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
  //페이지 작성단위 상수로 만들어서 불러오기

  // 트랜잭션
  // async connectDB(): Promise<any> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const result = //이 시점에 쿼리 날림
  //     await queryRunner.commitTransaction();
  //     return result;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  //읽기, 수정, 삭제 할 때 작성자 확인하는 것을 subcriber 이용해서 할 수 있는지?

  //게시판 목록 읽기
  //페이지 네이션 이게 맞는지?
  // 전체글 긁어오는 쿼리와 페이지 계산을 따로?
  // 혹은 전체클 긁는 쿼리 + 해당 쿼리를 페이지네이션?
  //총 페이지 계산 필요?
  async listBoards(page: number): Promise<Board[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countAllBoards(queryRunner);
      console.log(count);
      if (Math.ceil(count / 15) < page) {
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
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //검색
  async searchBoards(keyword: string, page: number): Promise<Board[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countBoardsBySearch(
        keyword,
        queryRunner,
      );
      console.log(count);
      if (Math.ceil(count / 15) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const previous = page * 15;
      const show = previous + 15;
      const result = await this.boardsRepository.selectBoardsBySearch(
        keyword,
        previous,
        show,
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
  //유저 작성글 목록
  async listUserBoards(userId: string, page: number): Promise<Board[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countUserBoards(
        userId,
        queryRunner,
      );
      console.log(count);
      if (Math.ceil(count / 15) < page) {
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
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //읽기 전 먼저 view 카운트 처리
  //본인 작성 게시글은 조회수 안올라감
  //스테이터스 먼저 가져가서 읽기 처리. 삭제나 신고된상태면 status만 전송, 노말일 경우 전체 읽어오기
  //이미지 보드에서 이미지들도 가져오기?
  async readBoard(boardId: number, userId: string): Promise<Board> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const wirterCheck = await this.boardsRepository.selectWriter(
        boardId,
        queryRunner,
      );
      if (userId !== wirterCheck.userId && wirterCheck.userId == 'normal') {
        const countedViews = await this.boardsRepository.updateView(
          boardId,
          queryRunner,
        );
        console.log(countedViews);
      }

      const result = await this.boardsRepository.selectBoard(
        boardId,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      console.log(result);
      const { status, deletedAt, ...normalBoard } = result;
      if (result.status !== 'normal') {
        return { status, deletedAt } as Board;
      }
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
  async editBoard(
    userId: string,
    updateboardDto: UpdateBoardDto,
  ): Promise<Board> {
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
      const result = await this.boardsRepository.updateBoard(
        updateboardDto,
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

  //게시글 삭제
  async eraseBoard(boardId: number, userId: string): Promise<Board> {
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
      const result = await this.boardsRepository.softDeleteBoard(
        boardId,
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
}
