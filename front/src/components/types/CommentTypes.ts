// 댓글 한 개에 담긴 데이터들의 타입
export interface CommentProps {
  boardId: any;
  commentId: string;
  userId: string;
  content: string;
  anonymous_number: number;
  position: string;
  status: string;
  createdAt: any;
  updatedAt: Date;
  deletedAt: Date;
  onDeleteChanged: any;
}

// 댓글 한 개가 담긴 객체 타입
export interface CommentType {
  comment: CommentProps;
}

// 게시글의 데이터 조회 api 호출 시 response로 받아오는 data 타입
export interface CommentsProps {
  count: number;
  list: CommentProps[];
  positiveCount: number;
  negativeCount: number;
  onDataChange?: any;
}

// 댓글 작성 시 req.body에 보낼 data 타입
export interface PostCommentType {
  boardId: any;
  content: string;
}
