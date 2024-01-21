import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BoardsRepository } from './boards.repository';
import { S3Service } from '../../common/s3.presigned';
import { Board } from './boards.entity';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Injectable()
export class BoardsService {
  constructor(
    private dataSource: DataSource,
    private boardsRepository: BoardsRepository,
    private s3Service: S3Service,
  ) {}

  //게시판 목록 읽기
  async listBoards(
    page: number,
    limit: number,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await this.boardsRepository.countAllBoards(queryRunner);
      console.log(count);
      if (count === 0) {
        return { count };
      } else if (Math.ceil(count / limit) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const offset = (page - 1) * limit;
      const result = await this.boardsRepository.selectAllBoards(
        offset,
        limit,
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
    limit: number,
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
      } else if (Math.ceil(count / limit) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const offset = (page - 1) * limit;
      const result = await this.boardsRepository.selectBoardsByTag(
        tag,
        offset,
        limit,
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
    limit: number,
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
      } else if (Math.ceil(count / limit) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const offset = (page - 1) * limit;
      const result = await this.boardsRepository.selectBoardsBySearch(
        keyword,
        offset,
        limit,
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
    limit: number,
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
      } else if (Math.ceil(count / limit) < page) {
        throw new Error('너무 큰 페이지 요청');
      }
      const offset = (page - 1) * limit;
      const result = await this.boardsRepository.selectBoardsByTagAndSearch(
        tag,
        keyword,
        offset,
        limit,
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
    limit: number,
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
      const offset = (page - 1) * 15;
      const result = await this.boardsRepository.selectUserBoards(
        userId,
        offset,
        limit,
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
  //스테이터스 먼저 가져가서 읽기 처리  //with delete 적용
  ////삭제나 신고된상태면 status만 전송: 프론트에서 삭제/신고된 게시물입니다 구분 안내 위해서..
  ////상태 정상일 경우 전체 읽어오기
  //이미지 url은 content 에 낑겨있음.
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
  //이미지 url은 content 에 낑겨있음.
  async writeBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('dto:', createBoardDto);
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

  //게시글 작성용 presignedURL 받아오기
  async getPreSignedUrl(userId: string, files: string[]) {
    const bucket = 'guruguru-board';
    const keys = files.map(
      (file) => userId + '_' + new Date().toISOString() + '_' + file,
    );
    try {
      const clientUrls = await this.s3Service.createPresignedUrl({
        bucket,
        keys,
      });
      return clientUrls;
    } catch (err) {
      console.error(err);
    }
  }

  //게시글 수정
  async editBoard(updateBoardDto: UpdateBoardDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.boardsRepository.updateBoard(updateBoardDto, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //게시글 삭제
  async eraseBoard(userId: string, boardId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.boardsRepository.softDeleteBoard(userId, boardId, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
