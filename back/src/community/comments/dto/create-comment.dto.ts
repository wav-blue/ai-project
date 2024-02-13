import { IsNotEmpty } from 'class-validator';
import { CommentPosition } from '../enum/CommentPosition.enum';

export class CreateCommentDto {
  @IsNotEmpty()
  boardId: number;

  @IsNotEmpty()
  content: string;

  userId: string;

  anonymous_number: number;

  position: CommentPosition;
}
