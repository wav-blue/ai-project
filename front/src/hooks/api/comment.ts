import {
  ChatResponseType,
  SendingMessageType,
} from '@/src/components/types/ChatTypes';
import { useBaseMutation, useBaseQuery } from './reactQueryConfig';
import {
  CommentProps,
  PostCommentType,
} from '@/src/components/types/CommentTypes';
import { useState } from 'react';

// 커스텀 훅 작성 가이드
// // 전체 댓글 읽기
export const useReadComments = () => {
  return useBaseQuery('/comments', 'readcomments');
};

// 댓글 작성하기
export const useWriteComment = () => {
  return useBaseMutation('/comments', 'post', 'boardComment');
};

// 댓글 삭제하기
export const useDeleteComment = (commentId: string) => {
  return useBaseMutation(`/comments/${commentId}`, 'delete', 'boardComment');
};

// 자신이 작성한 댓글 목록 조회
export const useMyComment = (page: number) => {
  return useBaseQuery(`/comments/my?page=${page}&limit=20`, 'myComment');
};

// 게시글에 작성된 댓글 목록 조회

export const useBoardComment = (boardId: any, page?: number) => {
  const [trigger, setTrigger] = useState(false);
  const { isLoading, error, data } = useBaseQuery(
    `/comments/${boardId}?page=${page}&limit=15`,
    'boardComment',
    trigger,
  );

  const executeQuery = () => {
    setTrigger(true);
  };

  console.log('data!! ', data);

  return {
    isLoading,
    error,
    data,
    executeQuery,
  };
};

//댓글 신고 접수
export const useReportComment = () => {
  return useBaseMutation('/comments/report', 'post', 'boardComment');
};
