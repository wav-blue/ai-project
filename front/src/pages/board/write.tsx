//import BoardEdit from '@/src/components/features/board/BoardEdit';
import BoardWrite from '@/src/components/features/board/BoardWrite';
import { useRouter } from 'next/router';
import { useState } from 'react';

const BoardWritingPage = () => {
  const [isEdit, setIsEdit] = useState(false);
  return <BoardWrite />;
  // return (
  //   <div>
  //     {isEdit ? (<BoardEdit/>) : (<BoardWrite />)}
  //   </div>
  // );
};

export default BoardWritingPage;

import * as Api from '../../utils/api'
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookie = context.req.headers.cookie || '';

  try {
    const res = await Api.get('/user/me', undefined, cookie)
    console.log(res)
    if (res.data) {
      return { props: {} };
    }
  } catch(err) {
    console.log(err)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}