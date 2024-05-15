import * as dayjs from 'dayjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { BoardsRepository } from './boards.repository';
import { S3Service } from '../../common/s3.presigned';
import { Board } from './boards.entity';
import {
  BoardSearchAndListDto,
  BoardsListQueryDto,
  CreateBoardDto,
  CreateBoardReportDto,
  UpdateBoardDto,
} from './boards.dto';

@Injectable()
export class BoardsService {
  constructor(
    private dataSource: DataSource,
    private boardsRepository: BoardsRepository,
    private s3Service: S3Service,
  ) {}

  private countPages(count: number, page: number, limit: number): number {
    console.log(count);
    if (count > 0 && Math.ceil(count / limit) < page) {
      throw new Error('너무 큰 페이지 요청');
    }
    const offset = (page - 1) * limit;
    return offset;
  }

  //게시판 목록 읽기
  async listBoards(
    query: BoardsListQueryDto,
  ): Promise<{ count: number; list: Board[] } | { count: number }> {
    const { keyword, tag, page, limit } = query;
    const queryRunner = this.dataSource.createQueryRunner();
    const boardSearchAndListDto: BoardSearchAndListDto = {
      keyword,
      tag,
      limit,
      queryRunner,
    };
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (keyword && tag) {
        //태그별 검색결과 목록
        const count = await this.boardsRepository.countBoardsByTagAndSearch(
          tag,
          keyword,
          queryRunner,
        );
        const offset = this.countPages(count, page, limit);
        const result = await this.boardsRepository.selectBoardsByTagAndSearch(
          boardSearchAndListDto,
          offset,
        );
        await queryRunner.commitTransaction();
        return { count, list: result };
      } else if (tag) {
        //태그별 게시글 목록
        const count = await this.boardsRepository.countBoardsByTag(
          tag,
          queryRunner,
        );
        const offset = this.countPages(count, page, limit);
        const result = await this.boardsRepository.selectBoardsByTag(
          boardSearchAndListDto,
          offset,
        );
        await queryRunner.commitTransaction();
        return { count, list: result };
      } else if (keyword) {
        //전체검색
        const count = await this.boardsRepository.countBoardsBySearch(
          keyword,
          queryRunner,
        );
        const offset = this.countPages(count, page, limit);
        const result = await this.boardsRepository.selectBoardsBySearch(
          boardSearchAndListDto,
          offset,
        );
        await queryRunner.commitTransaction();
        return { count, list: result };
      }
      //전체게시글
      const count = await this.boardsRepository.countAllBoards(queryRunner);
      const offset = this.countPages(count, page, limit);
      const result = await this.boardsRepository.selectAllBoards(
        boardSearchAndListDto,
        offset,
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

  async readBoardWithQueryRunner(
    boardId: number,
    queryRunner: QueryRunner,
  ): Promise<Board> {
    const result = await this.boardsRepository.selectBoard(
      boardId,
      queryRunner,
    );

    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다');
    }

    const { status, deletedAt, ...normalBoard } = result;
    if (result.status !== 'normal') {
      return { status, deletedAt } as Board;
    }
    // 삭제 | 신고되지 않은 정상 게시물일 경우
    await this.boardsRepository.updateView(boardId, queryRunner); //조회수 올림
    normalBoard.views += 1; //보내주는 녀석엔 이미 가져왔던 결과에 조회수 1 반영.
    return normalBoard as Board;
  }

  //스테이터스 먼저 가져가서 읽기 처리  //with delete 적용
  ////삭제나 신고된상태면 status만 전송: 프론트에서 삭제/신고된 게시물입니다 구분해서 안내하기 위해서..
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

      if (!result) {
        throw new NotFoundException('게시물을 찾을 수 없습니다');
      }

      const { status, deletedAt, ...normalBoard } = result;
      if (result.status !== 'normal') {
        return { status, deletedAt } as Board;
      }
      // 삭제 | 신고되지 않은 정상 게시물일 경우
      await this.boardsRepository.updateView(boardId, queryRunner); //조회수 올림
      normalBoard.views += 1; //보내주는 녀석엔 이미 가져왔던 결과에 조회수 1 반영.
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
      (file) =>
        userId + '_' + dayjs().format('YYYY-MM-DDTHH:mm:ss') + '_' + file,
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

  // 신고 내역 작성 && 신고 누적 시 삭제
  async createBoardReport(
    userId: string,
    createBoardReportDto: CreateBoardReportDto,
  ) {
    // 변수 선언
    createBoardReportDto.reportUserId = userId;

    let foundBoard: Board;
    let commentStatus = 'normal';

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const { boardId, reportUserId } = createBoardReportDto;

      // 신고된 게시글의 정보 조회
      foundBoard = await this.boardsRepository.selectBoard(
        boardId,
        queryRunner,
      );
      if (!foundBoard || foundBoard.status !== 'normal') {
        // 해당하는 게시글의 정보가 데이터베이스 내에 없음
        // 혹은 게시글이 이미 삭제되어 신고할 수 없음
        throw new NotFoundException('이미 삭제된 게시글');
        // throw new Error('이미 삭제된 게시글');
      }

      if (foundBoard.userId === reportUserId) {
        console.log(`자신의 게시글을 삭제하려고 함`);
        // 테스트가 힘들어지기 때문에 임시로 주석 처리
        // throw new ConflictException('잘못된 신고 요청');
      }

      // 작성자의 id를 DTO에 저장
      createBoardReportDto.targetUserId = foundBoard.userId;

      // 해당 게시글을 report한 User들의 기록을 조회
      const reportUserList = await this.boardsRepository.checkReportUser(
        boardId,
        queryRunner,
      );

      // 동일 인물이 하나의 게시글에 대해 중복 신고하는 경우 Error
      for (let i = 0; i < reportUserList.length; i++) {
        if (reportUserList[i].report_user_id === reportUserId) {
          // 한 유저가 같은 게시글을 두번 신고할 수 없음
          throw new ConflictException('이미 신고된 게시글');
        }
      }

      // 신고내역 테이블에 추가
      await this.boardsRepository.insertBoardReport(
        createBoardReportDto,
        queryRunner,
      );

      // 일정 횟수 신고되어 댓글 삭제
      // 지금 발생한 신고를 포함해서 5이상일 경우 삭제
      if (reportUserList.length + 1 >= 5) {
        const { boardId } = createBoardReportDto;
        commentStatus = 'reported';

        await this.boardsRepository.reportBoard(boardId, queryRunner);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // 현재 게시글의 상태를 응답으로 반환
    return { status: commentStatus };
  }
}
