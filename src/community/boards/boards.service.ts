import { Injectable } from '@nestjs/common';
import { BoardsRepository } from './boards.repository';
import { Board } from './boards.entity';
import { CreateBoardDto } from './dtos/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  async getPostsList() {
    return this.boards;
  }
}
