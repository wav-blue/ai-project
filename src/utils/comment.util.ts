import { Comment } from 'src/community/comments/entity/comments.entity';
import { AnonymousNumberType } from 'src/community/comments/enum/AnonymousNumberType.enum';
import { CommentPosition } from 'src/community/comments/enum/CommentPosition.enum';
import { CommentStatus } from 'src/community/comments/enum/CommentStatus.enum';

function randomPosition(): CommentPosition {
  let position = CommentPosition.POSITIVE;
  const random_number = Math.random();
  if (random_number < 0.5) {
    position = CommentPosition.NEGATIVE;
  }
  return position;
}

// 삭제된 데이터 배열을 받아서 반환
function parseDeletedComment(comments: Comment[]): Comment[] {
  for (let i = 0; i < comments.length; i++) {
    delete comments[i].userId;
    delete comments[i].updatedAt;
    if (comments[i].status !== CommentStatus.NOT_DELETED) {
      comments[i].anonymous_number = AnonymousNumberType.DELETED;
      comments[i].content = '삭제된 댓글입니다.';
      comments[i].status = CommentStatus.DELETED;
      comments[i].position = 'deleted';
      comments[i].createdAt = new Date();
    }
  }
  return comments;
}

// 긍정, 부정 포지션의 댓글 수 반환
function countPositionOfComment(comments: Comment[]): {
  positiveCount: number;
  negativeCount: number;
} {
  let positiveCount = 0;
  let negativeCount = 0;
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].position === 'positive') {
      positiveCount += 1;
    }
    if (comments[i].position === 'negative') {
      negativeCount += 1;
    }
  }
  return { positiveCount, negativeCount };
}

export { randomPosition, parseDeletedComment, countPositionOfComment };
