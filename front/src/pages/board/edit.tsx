import BoardEdit from '@/src/components/features/board/BoardEdit';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
interface BoardCardTypeMini {
  post: any;
}
const BoardEditingPage = ({ post }: BoardCardTypeMini) => {
  // 데이터 전달 받기
  const router = useRouter();
  const detail = typeof router.query.detail === 'string' ? router.query.detail : '{}';
  const parsed = JSON.parse(detail);
  return <BoardEdit post={parsed} />;
};

export default BoardEditingPage;

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