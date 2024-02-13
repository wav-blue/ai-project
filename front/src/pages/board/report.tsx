import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useReportBoard } from '@/src/hooks/api/board';
import { useReportComment } from '@/src/hooks/api/comment';
import { AxiosError } from 'axios';

const ReportPage = () => {
  const router = useRouter();

  // 아무것도 선택하지 않았을 경우 -1
  const [userSelect, setUserSelect] = useState(-1);

  // query에서 boardId를 받아온 경우 게시글/ commentId를 받아온 경우 댓글
  const boardId = router.query?.reportTargetBoardId;
  const commentId = router.query?.commentId;
  //const reportBoard = useReportPost();
  const reportBoard = useReportBoard();
  const reportComment = useReportComment();

  const handleReport = async () => {
    // 사용자가 선택하지 않음
    if (userSelect === -1) {
      alert('신고 사유를 선택해주세요');
      return;
    }
    // boardId가 있으면 reportBoard로
    // commentId가 있으면 reportComment로
    if (boardId) {
      reportBoard.mutate({
        boardId: boardId,
        reportType: boardReportType[userSelect],
      });
    } else {
      reportComment.mutate({
        commentId: commentId,
        reportType: commentReportType[userSelect],
      });
    }
  };

  useEffect(() => {
    if (reportComment.error) {
      const { error } = reportComment;
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          alert('로그인이 필요한 기능입니다!');
        }

        if (error.response?.status === 409) {
          alert('이미 접수된 신고 내역입니다!');
        }
      }

      router.back();
    }
    // 댓글 신고 성공
    if (reportComment.isSuccess && reportComment.data) {
      console.log(
        '댓글 신고 성공!!!!! 백엔드에서 보낸 응답 ',
        reportComment.data.data.status, //normal / reported
      );
      alert('신고가 접수되었습니다!');

      // 뒤로 가기
      router.back();
    }
  }, [reportComment]);

  /* --- 게시글 신고 --- */
  //   // useReportBoard 선언?

  useEffect(() => {
    if (reportBoard.error) {
      const { error } = reportBoard;
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          alert('로그인이 필요한 기능입니다!');
        }

        if (error.response?.status === 409) {
          alert('이미 접수된 신고 내역입니다!');
        }
      }

      router.back();
    }
    // 게시글 신고 성공
    if (reportBoard.isSuccess && reportBoard.data) {
      console.log(
        '게시글 신고 성공!!!!! 백엔드에서 보낸 응답 ',
        reportBoard.data.data.status,
      );
      alert('신고가 접수되었습니다!');

      // 뒤로 가기
      router.back();
    }
  }, [reportBoard]);

  const handleCancle = async () => {
    // 뒤로 가기
    router.back();
  };

  // 게시글의 신고 종류
  const boardReportType = [
    '광고성 게시물',
    '음란성 게시물',
    '욕설/부적절한 언어',
    '회원 분란 유도',
    '혐오감 조성',
    '명예훼손',
    '도배성 게시물',
    '게시판 성격에 맞지 않는 게시물',
  ];

  // 댓글의 신고 종류
  const commentReportType = [
    '광고성 댓글',
    '음란성 댓글',
    '욕설/부적절한 언어',
    '회원 분란 유도',
    '혐오감 조성',
    '명예훼손',
    '도배성 댓글',
  ];

  return (
    <div className="flex flex-col gap-3">
      {boardId ? <div>게시물 신고하기</div> : <div>댓글 신고하기</div>}
      <div>* 허위신고일 경우, 신고자의 서비스 이용이 제한될 수 있습니다.</div>
      <hr />
      <div>
        <fieldset>
          <legend>신고 사유를 선택해주세요.</legend>
          <div>
            {boardId ? (
              <div className="flex flex-col">
                {boardReportType.map((data, idx) => (
                  <div key={idx}>
                    <label>{data}</label>
                    <input
                      type="radio"
                      name="reportType"
                      value={data}
                      onChange={e => {
                        setUserSelect(idx);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {commentReportType.map((data, idx) => (
                  <div key={idx}>
                    <label>{data}</label>
                    <input
                      type="radio"
                      name="reportType"
                      value={data}
                      onChange={e => {
                        setUserSelect(idx);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </fieldset>
        <button
          onClick={handleReport}
          className="rounded border-2 w-1/12 border-gray-300"
        >
          신고하기
        </button>
        <button
          onClick={handleCancle}
          className="rounded border-2 w-1/12 border-gray-300"
        >
          취소
        </button>
      </div>
    </div>
  );
};
export default ReportPage;
