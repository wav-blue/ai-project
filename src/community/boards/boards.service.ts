import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardsService {
  private boards = [];

  getPostsList() {
    return this.boards;
  }
}
