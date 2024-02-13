import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useRouter } from 'next/router';
import HandleBoards from '../components/features/user/HandleBoards';
import HandleComments from '../components/features/user/HandleComments';
import HandleServices from '../components/features/user/HandleServices';
import HandleUsers from '../components/features/user/HandleUsers';
import withAuth from '../hocs/withAuth';

const limit = 15;

const MyPage = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const [commentPage, setCommentPage] = useState(1);
  const [boardPage, setboardPage] = useState(1);
  const commentQuery = `?page=${commentPage}&limit=${limit}`;
  const boardQuery = `?page=${boardPage}&limit=${limit}`;
  const [selectedComponent, setSelectedComponent] = useState(<HandleUsers />);

  const handleSelectComponent = (component: any) => {
    setSelectedComponent(component);
  };

  return (
    <div>
      <div className="fixed left-[15vw] top-0 h-screen w-[25vw] border-[#f3edee] border-2 shadow-lg bg-white/90 p-5 flex flex-col items-center gap-10">
        <button
          className="border border-black h-10 w-5/6 text-center mt-[20vh] hover:bg-[#f5e2e7]"
          onClick={() => handleSelectComponent(<HandleUsers />)}
        >
          유저 정보
        </button>
        <button
          className="border border-black h-10 w-5/6 text-center hover:bg-[#f5e2e7]"
          onClick={() => handleSelectComponent(<HandleBoards />)}
        >
          작성한 게시글
        </button>
        <button
          className="border border-black h-10 w-5/6 text-center hover:bg-[#f5e2e7]"
          onClick={() => handleSelectComponent(<HandleComments />)}
        >
          작성한 댓글
        </button>
        <button
          className="border border-black h-10 w-5/6 text-center hover:bg-[#f5e2e7]"
          onClick={() => handleSelectComponent(<HandleServices />)}
        >
          멤버십 정보/변경
        </button>
      </div>
      <div className="absolute left-[40vw] top-0 p-5 w-[60vw] h-screen flex bg-[#f3edee]/40 ">        
        {selectedComponent}
      </div>
    </div>
  );
};

export default withAuth(MyPage);

import * as Api from '../utils/api';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookie = context.req.headers.cookie || '';

  try {
    const res = await Api.get('/user/me', undefined, cookie);
    console.log(res);
    if (res.data) {
      return { props: {} };
    }
  } catch (err) {
    console.log(err);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
