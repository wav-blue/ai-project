import { IsNotEmpty } from 'class-validator';

export class ReadCommentDto {
  constructor(data: any) {
    this.boardId = data;
    this.content = data;
    this.anonymous_number = data;
    this.position = data;
    this.createdAt = data;
    this.status = data;
  }

  @IsNotEmpty()
  boardId: number;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  anonymous_number: number;

  @IsNotEmpty()
  position: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  createdAt: string;
}
