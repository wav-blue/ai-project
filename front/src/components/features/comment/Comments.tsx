import { CommentProps, CommentsProps } from '../../types/CommentTypes';

import Comment from './Comment';
import { useEffect, useState } from 'react';
//import Pagination from './CommentPagination';
import { useRouter } from 'next/router';
const Comments = ({ onDataChange, list }: CommentsProps) => {
  console.log('Comments.tsx');
  //댓글이 삭제 되었을때 부모 컴포넌트에 알려줄 함수
  const [isDeletedRefresh, setIsDeletedRefresh] = useState(false);
  const sendDataToParent = () => {
    console.log('sendDataToParent(댓글삭제');
    setIsDeletedRefresh(true);
    console.log('sendDataToParent(댓글삭제 2222222222222222222');
    onDataChange(isDeletedRefresh); // 콜백 함수 호출하여 데이터 전달
    console.log('sendDataToParent(댓글삭제 3333333333333333333');
  };

  const router = useRouter();
  const { page } = router.query;
  const commentsData = list;
  const [currentPage, setCurrentPage] = useState(1);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  useEffect(() => {}, [currentPage]);

  //댓글삭제되었을때 프롭스전달을 위한
  const [isDeleted, setIsDeleted] = useState(false);
  const isCommentDeleted = (flag: any) => {
    console.log('isCommentDeleted flag값 확인 : ', flag);
    //setIsRefresh(flag);
    setIsDeleted(true);
    sendDataToParent();
  };
  return (
    <div>
      <div className="flex flex-col">
        {commentsData.map((data: CommentProps, idx: number) => (
          <div key={idx}>
            <Comment {...data} onDeleteChanged={isCommentDeleted} />
          </div>
        ))}
      </div>

      {/* <Pagination
        totalContents={count}
        contentsPerPage={1}
        currentPage={currentPage}
        paginate={paginate}
      /> */}
    </div>
  );
};

export default Comments;
