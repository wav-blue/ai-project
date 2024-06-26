import { IsNotEmpty } from 'class-validator';
import { parseDeletedComment } from '../util/comment.util';

export class ReadCommentsByBoardIdDto {
  constructor({ commentList, positiveCount, negativeCount, count }) {
    // 삭제된 댓글 내용 변경
    commentList = parseDeletedComment(commentList);

    this.list = commentList;
    this.positiveCount = positiveCount;
    this.negativeCount = negativeCount;
    this.count = count;
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
