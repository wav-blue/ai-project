import { IsNotEmpty } from 'class-validator';
import { CommentPosition } from '../enum/commentPosition.enum';

export class ReadNewCommentDto {
  constructor(comment: any) {
    this.commentId = comment.commentId;
    this.boardId = comment.boardId;
    this.content = comment.content;
    this.anonymousNumber = comment.anonymousNumber;
    this.position = comment.position;
    this.createdAt = comment.createdAt;
    this.status = comment.status;
  }

  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  boardId: number;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  anonymousNumber: number;

  @IsNotEmpty()
  position: CommentPosition;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  createdAt: string;
}
