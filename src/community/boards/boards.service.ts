import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { BoardsRepository } from './boards.repository';
import { Board } from './boards.entity';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Injectable()
export class BoardsService {
  private queryRunner: QueryRunner;
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Board)
    private readonly boardsRepository: BoardsRepository,
  ) {}

  //트랜잭션 이게 맞나..
  async connectDB(operation: () => Promise<any>): Promise<any> {
    try {
      this.queryRunner = this.dataSource.createQueryRunner();
      await this.queryRunner.connect();
      await this.queryRunner.startTransaction();
      await operation(); // Execute the provided operation within the transaction
      await this.queryRunner.commitTransaction();
    } catch (error) {
      await this.queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await this.queryRunner.release();
    }
  }

  //읽기, 수정, 삭제 할 때 작성자 확인하는 것을 subcriber 이용해서 할 수 있는지?

  //게시판 목록 읽기
  //페이지 네이션 이게 맞는지?
  async listBoards(page: number): Promise<Board[]> {
    // Usage of connectDB to wrap listBoards in a transaction
    return await this.connectDB(async () => {
      const previous = page * 15;
      const show = previous + 15;
      return await this.boardsRepository.selectAllBoards(previous, show);
    });
  }

  //검색
  async searchBoards(keyword: string, page: number): Promise<Board[]> {
    return await this.connectDB(async () => {
      const previous = page * 15;
      const show = previous + 15;
      return await this.boardsRepository.selectBoardsBySearch(
        keyword,
        previous,
        show,
      );
    });
  }

  //읽기 전 먼저 view 카운트 처리
  //본인 작성 게시글은 조회수 안올라감
  //스테이터스 먼저 가져가서 읽기 처리. 삭제나 신고된상태면 status만 전송, 노말일 경우 전체 읽어오기
  //이미지 보드에서 이미지들도 가져오기?
  async readBoard(boardId: number, userId: string): Promise<Board | string> {
    return await this.connectDB(async () => {
      const wirterCheck = await this.boardsRepository.selectWriter(boardId);
      if (userId !== wirterCheck.userId) {
        const contedViews = await this.boardsRepository.updateView(boardId);
        console.log(contedViews);
      }

      const result = await this.boardsRepository.selectBoard(boardId);
      if (result.status !== 'nomal') {
        return result.status;
      }
      return result;
    });
  }

  //게시글 작성
  async writeBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    return await this.connectDB(async () => {
      const result = await this.boardsRepository.insertBoard(createBoardDto);
      return result;
    });
  }

  //게시글 수정
  async editBoard(
    userId: string,
    updateboardDto: UpdateBoardDto,
  ): Promise<Board> {
    return await this.connectDB(async () => {
      const wirterCheck = await this.boardsRepository.selectWriter(
        updateboardDto.boardId,
      );
      if (userId !== wirterCheck.userId) {
        throw new Error('작성자가 아님');
      }
      const result = await this.boardsRepository.updateBoard(updateboardDto);
      return result;
    });
  }

  //게시글 삭제
  async eraseBoard(boardId: number, userId: string): Promise<Board> {
    return await this.connectDB(async () => {
      const wirterCheck = await this.boardsRepository.selectWriter(boardId);
      if (userId !== wirterCheck.userId) {
        throw new Error('작성자가 아님');
      }
      const result = await this.boardsRepository.softDeleteBoard(boardId);
      return result;
    });
  }
}
