import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  boardId: number;

  @IsNotEmpty()
  content: string;

  anonymous_number;

  position: string;
}
