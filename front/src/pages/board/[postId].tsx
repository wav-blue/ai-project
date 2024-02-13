import BoardCardDetail from '../../components/features/board/BoardCardDetail';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import Comments from '@/src/components/features/comment/Comments';

//백엔드 통신 관련 임시코드
import axios from 'axios';
import CommentInput from '@/src/components/features/comment/CommentInput';
import withAuth from '@/src/hocs/withAuth';
import CommentAnalysis from '@/src/components/features/comment/CommentAnalysis';
//댓글 페이지네이션 추가용 모듈 import
import Pagination from '../../components/features/comment/CommentPagination';
import Seo from '@/src/components/common/Seo';

const serverUrl = 'http://kdt-ai-9-team01.elicecoding.com:5001/api';
const config = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  },
};
const api = axios.create({
  baseURL: serverUrl,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true,
});

const PostviewPage = () => {
  //댓글새로고침클릭
  const [isRefresh, setIsRefresh] = useState(false);
  const isCommentRefresh = (flag: any) => {

    setIsRefresh(true);

  };
  // const isClick = () => {
  //   setIsRefresh(true);
  // };
  //댓글 페이지 값 관리
  const router = useRouter();
  const commentpage = Number(router.query.page);
  const [currentPage, setCurrentPage] = useState(1);
  const commentPaginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const postId = router.query.postId;

  useEffect(() => {
    // 페이지 변경 시
    if (!commentpage) return;
    setCurrentPage(Number(commentpage)); // 현재 페이지 상태 변경 -> Pagination리렌더링
    getCommentList();

    //getBoardlist(searchKeyword); // 컨텐츠 데이터 새롭게 불러와 상태 변경 -> ProductList리렌더링
  }, [commentpage]);

  const [comments, setComments] = useState({
    count: 0,
    list: [],
    positiveCount: 0,
    negativeCount: 0,
  });

  useEffect(() => {
    setIsRefresh(false);
    console.log('useEffect isRefresh 확인 : ', isRefresh);
    getCommentList();
  }, [postId, isRefresh]);
  const [post, setPost] = useState<BoardDataType>();

  //ㄹ그인여부 본인게시글
  const userState = useSelector((state: RootState) => state.user.user);

  // 게시글이 없으면 isLoaded되지 않도록
  const [isLoaded, setIsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const limit = 15;
  const commentQuery = `?$page=${page}&limit=${limit}`;

  const getPost = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/boards/${postId}`);
      console.log(data);
      setPost(data);
      setIsLoaded(true);
    } catch (error) {
      console.log('getPost error');
      console.log(error);
    }
  };

  const getCommentList = async () => {

    try {
      const response = await axios.get(
        `${serverUrl}/comments/${postId}?page=${currentPage}`,
        config,
      );
      console.log('Commentdata:', response.data);
      setComments(response.data);
      //setComments(boardComment.data?.data);
      return response.data;
    } catch (error) {
      console.error('getCommentList error');
      console.error(error);
    }
  };

  useEffect(() => {
    getPost();
  }, [postId]);

  const hasComments =
    comments && comments.count !== undefined && comments.list !== undefined;

  if (post && userState) {
    console.log(
      '로그인한 유저와 작성자 id 일치 확인',
      userState.userId === post.userId,
    );
  }
  if (hasComments) {
    console.log('comments : ', comments);
    console.log('comments.count : ', comments.count);
  }

  return (
    <div className="flex flex-col gap-3">
      <Seo title='게시글 상세페이지' />
      <div>{post && <BoardCardDetail id={postId} post={post} />}</div>
      {/* <button onClick={isClick}>댓글새로고침</button> */}
      <div>
        {hasComments && (
          <CommentAnalysis
            count={comments.count}
            list={comments.list}
            positiveCount={comments.positiveCount}
            negativeCount={comments.negativeCount}
            onDataChange={isCommentRefresh}
          />
        )}
      </div>
      <br />
      <br />
      <div>
        {hasComments && (
          <Comments
            onDataChange={isCommentRefresh}
            count={comments.count}
            list={comments.list}
            positiveCount={comments.positiveCount}
            negativeCount={comments.negativeCount}
          />
        )}
      </div>
      {hasComments && comments.count != 0 && (
        <Pagination
          totalContents={comments.count}
          bNumber={postId}
          //totalContents={15}
          contentsPerPage={15}
          currentPage={currentPage}
          paginate={commentPaginate}
        />
      )}

      <CommentInput onDataChange={isCommentRefresh} />
    </div>
  );
};
export default withAuth(PostviewPage);
