import { Comment } from '../entity/comments.entity';
import { AnonymousNumberType } from '../enum/anonymousNumberType.enum';
import { CommentPosition } from '../enum/commentPosition.enum';
import { CommentStatus } from '../enum/commentStatus.enum';

// 랜덤으로 Position 결정
function randomPosition(): CommentPosition {
  let position = CommentPosition.POSITIVE;
  const random_number = Math.random();
  if (random_number < 0.5) {
    position = CommentPosition.NEGATIVE;
  }
  return position;
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

function parseDeletedComment(comments: Comment[]): Comment[] {
  for (let i = 0; i < comments.length; i++) {
    delete comments[i].updatedAt;
    if (comments[i].status !== CommentStatus.NOT_DELETED) {
      comments[i].anonymousNumber = AnonymousNumberType.DELETED;
      comments[i].content = '삭제된 댓글입니다.';
      comments[i].status = CommentStatus.DELETED;
    }
  }
  return comments;
}

export { randomPosition, bytesToBase64, parseDeletedComment };
