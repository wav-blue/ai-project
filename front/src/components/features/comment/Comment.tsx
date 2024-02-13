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
    anonymous_number,
    position,
    userId,
    status,
    createdAt,
    deletedAt,
    commentId,
    onDeleteChanged,
  } = commentData;
  //const isDeleted = onDeleteChanged
  const [isDeleteRefresh, setIsDeleteRefresh] = useState(false);

  const sendDataToParent = () => {
    console.log('Comment.tsx 666666666666');
    console.log('sendDataToParent(댓글삭제)');
    setIsDeleteRefresh(true);
    console.log('Comment.tsx 777777777777777777777777777');
    onDeleteChanged(isDeleteRefresh); // 콜백 함수 호출하여 데이터 전달
    console.log('Comment.tsx 88888888888888888888888888');
  };

  //한국시간으로 변경하는 로직
  function changeUtcTimeToKst(date: any) {
    // 플러그인 사용
    dayjs.extend(utc);
    dayjs.locale('ko');

    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  //현재 로그인중인 사용자 아이디 받아오는 부분(댓글삭제가능여부판단용)
  const userState = useSelector((state: RootState) => state.user.user);
  console.log(
    'userState.userId(현재 로그인중인 유저아이디 : ',
    userState.userId,
  );

  //댓글삭제관련
  const deleteComment = useDeleteComment(commentId);

  const handleDelete = async () => {
    console.log('Comment.tsx 1111111111111111111');
    deleteComment.mutateAsync(commentId);
    console.log('Comment.tsx 2222222222222222222222');
    // setIsDeleteRefresh(true);
    // sendDataToParent();
  };
  useEffect(() => {
    if (deleteComment.data) {
      console.log('Comment.tsx 33333333333333333');
      console.log('================== 댓글 삭제 성공 ===============');
      setIsDeleteRefresh(true);
      console.log('Comment.tsx 444444444444444444444');
      console.log('handleDelete(댓글삭제)');
      sendDataToParent();
      console.log('Comment.tsx 555555555555555555');
    }
  }, [deleteComment.data]);

  const router = useRouter();

  const handleReport = async () => {
    console.log(`신고 화면으로 이동!`);
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
          {position && position == 'positive' && (
            <img
              src="/images/happy.png"
              className="rounded-full h-[26px] w-[26px]"
            ></img>
          )}
          {position && position == 'negative' && (
            <img
              src="/images/angry.png"
              className="rounded-full h-[26px] w-[26px]"
            ></img>
          )}
          <p className="inline-block text-gray-800 font-semibold">{`익명${anonymous_number}`}</p>

          <p className="text-gray-700">{position}</p>
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
