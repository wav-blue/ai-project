import { IsNotEmpty } from 'class-validator';

export class ReadCommentsByBoardIdDto {
  constructor({ commentList, positiveCount, negativeCount }) {
    this.list = commentList;
    this.positiveCount = positiveCount;
    this.negativeCount = negativeCount;
    this.count = positiveCount + negativeCount;
  }

  @IsNotEmpty()
  count: number;

  @IsNotEmpty()
  list: Comment[];

  @IsNotEmpty()
  positiveCount: number;

  @IsNotEmpty()
  negativeCount: number;
}
