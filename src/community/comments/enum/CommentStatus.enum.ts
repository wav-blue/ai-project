export enum CommentStatus {
  NOT_DELETED = 'not_deleted', // 기본 상태
  DELETED = 'deleted', // 본인이 삭제함
  REPORTED = 'reported', // 신고 누적으로 삭제됨
}
