import { IsNotEmpty } from 'class-validator';
import { parseDeletedComment } from '../util/comment.util';

export class ReadCommentsByUserIdDto {
  constructor({ commentList, count }) {
    // 삭제된 댓글 내용 변경
    commentList = parseDeletedComment(commentList);
    
    this.list = commentList;
    this.count = count;
  }

  @IsNotEmpty()
  count: number;

  @IsNotEmpty()
  list: Comment[];
}
