//get 요청으로 받아올 전체 post목록(임시)
import PostCards from '@/src/components/features/board/PostCards';
//import BoardList from '@/src/components/features/board/BoardList.jsx';
import Link from 'next/link';
import { useEffect, useState, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';
//백엔드 통신 관련 임시코드
import axios from 'axios';
import Pagination from '@/src/components/features/board/Pagination';
import { RootState } from '@/src/store';
import withAuth from '@/src/hocs/withAuth';
import Seo from '@/src/components/common/Seo';

const serverUrl = 'http://kdt-ai-9-team01.elicecoding.com:5001/api';

const BoardPage = () => {
  const [boardList, setBoardList] = useState<BoardDataTypeList>({
    count: 0,
    list: [],
  });

  const router = useRouter();
  const { page } = router.query;
  const [currentPage, setCurrentPage] = useState(1);

  const config = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    },
  };

  //검색기능구현
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  //태그속성추가
  const [tag, setTag] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target; //event.target에서 name과 value만 가져오기
    setSearchInput(value);
  };

  const getKeyword = () => {
    setSearchKeyword(searchInput);
    setCurrentPage(1);
  };
  const getBoardlist = async (searchKeyword: String) => {

    try {
      const response = await axios.get(
        `${serverUrl}/boards?tag=${tag}&keyword=${searchKeyword}&page=${currentPage}`,
        config,
      );

      setBoardList(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getBoardlist(searchKeyword);
  }, [searchKeyword, tag]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    // 페이지 변경 시
    if (!page) return;
    setCurrentPage(Number(page)); // 현재 페이지 상태 변경 -> Pagination리렌더링
    getBoardlist(searchKeyword); // 컨텐츠 데이터 새롭게 불러와 상태 변경 -> ProductList리렌더링
  }, [page]);


  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-[url('/images/background-board.jpg')]">
      <Seo title='게시글 목록' />
      <div className="my-20">
        <input
          type="text"
          name="sv"
          id=""
          placeholder="검색어를 입력하세요"
          value={searchInput}
          onChange={event => handleInputChange(event)}
        />
        {/* <button onClick={getBoardlist(searchKeyword)}>검색</button> */}
        <button onClick={getKeyword}>검색</button>
        {/* <br />
        <button onClick={getKeyword}>통합검색</button> */}
      </div>
      <div className="my-10">
        <select onChange={e => setTag(e.target.value)}>
          <option value="" selected>
            전체
          </option>
          <option value="free">일상고민</option>
          <option value="divorce">이혼</option>
          <option value="love">사랑</option>
          <option value="marriage">결혼</option>
        </select>
      </div>

      {/* <div>
        <BoardList boardList={boardList} />
      </div> */}
      <div>
        <PostCards count={boardList.count} list={boardList.list} />
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <Pagination
        totalContents={boardList.count}
        contentsPerPage={15}
        currentPage={currentPage}
        paginate={paginate}
      />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default withAuth(BoardPage);
