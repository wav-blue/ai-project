import { Controller, Get, Logger } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';

@Controller('boards')
export class BoardsController {
  // 어디에서 Logger를 내보내고 있는지 ->여기선 BoardsController
  private logger = new Logger('BoardsController');
  constructor(private boardsService: BoardsService) {}

  @Get('/')
  getAllBoard(): Promise<Board[]> {
    this.logger.log(`get 요청 받아짐`);
    return this.boardsService.getAllBoards();
  }
}
