import { useDeleteComment, useReportComment } from '@/src/hooks/api/comment';
import { CommentProps } from '../../types/CommentTypes';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ko';
//댓글 하나 출력
const Comment = (commentData: CommentProps) => {
  const {
    content,
    anonymousNumber,
    position,
    userId,
    createdAt,
    deletedAt,
    commentId,
    onDeleteChanged,
  } = commentData;
  //const isDeleted = onDeleteChanged
  const [isDeleteRefresh, setIsDeleteRefresh] = useState(false);

  const sendDataToParent = () => {
    setIsDeleteRefresh(true);
    onDeleteChanged(isDeleteRefresh); // 콜백 함수 호출하여 데이터 전달
  };

  //한국시간으로 변경하는 로직
  function changeUtcTimeToKst(date: any) {
    // 플러그인 사용
    dayjs.extend(utc);
    dayjs.locale('ko');

    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  function analysisText(position: number) {
    if (position == 1) {
      return 'positive';
    } else if (position == -1) {
      return 'negatvie';
    }
    return 'loading...';
  }

  //현재 로그인중인 사용자 아이디 받아오는 부분(댓글 삭제 가능 여부 판단용)
  const userState = useSelector((state: RootState) => state.user.user);
  console.log(
    'userState.userId(현재 로그인중인 유저아이디 : ',
    userState.userId,
  );

  //댓글 삭제 관련
  const deleteComment = useDeleteComment(commentId);

  const handleDelete = async () => {
    deleteComment.mutateAsync(commentId);
  };
  useEffect(() => {
    if (deleteComment.data) {
      setIsDeleteRefresh(true);
      sendDataToParent();
    }
  }, [deleteComment.data]);

  const router = useRouter();

  const handleReport = async () => {
    // 신고 화면으로 이동
    router.push({
      pathname: `/board/report`,
      query: {
        commentId,
      },
    });
  };

  if (deletedAt) {
    return (
      <div className="bg-red-50 p-4 m-1 border-y-2 border-red-100">
        <p className="text-gray-500 italic">삭제된 댓글입니다</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 m-1 border-y-2 border-red-100">
      <div className="flex flex-col gap-3">
        <div className="flex flex gap-3">
          {position == 1 && (
            <img
              src="/images/happy.png"
              className="rounded-full h-[26px] w-[26px]"
            ></img>
          )}
          {position == -1 && (
            <img
              src="/images/angry.png"
              className="rounded-full h-[26px] w-[26px]"
            ></img>
          )}
          <p className="inline-block text-gray-800 font-semibold">{`익명${anonymousNumber}`}</p>

          <p className="text-gray-700">{analysisText(position)}</p>
          {userState && userState.userId === userId ? (
            <button onClick={handleDelete}>삭제</button>
          ) : (
            <button onClick={handleReport}>신고</button>
          )}

          <p className="text-gray-700">{changeUtcTimeToKst(createdAt)}</p>
        </div>
        <p className="text-gray-700">{content}</p>
      </div>
    </div>
  );
};

export default Comment;
