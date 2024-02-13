import { useState, useEffect } from 'react';
import Link from 'next/link';
import BoardEdit from './BoardEdit';
import React from 'react';
import DOMPurify from 'dompurify';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

//백엔드 통신 관련 임시코드
import axios from 'axios';
const serverUrl = 'kdt-ai-9-team01.elicecoding.com:5001/api';

const api = axios.create({
  baseURL: serverUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ko';
const BoardCardDetail = ({ id, post }: BoardCardType) => {
  //한국시간으로 변경하는 로직
  function changeUtcTimeToKst(date: any) {
    // 플러그인 사용
    dayjs.extend(utc);
    dayjs.locale('ko');

    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  //게시글 신고 관련
  const reportTargetBoardId = post.boardId;
  const handleReport = async () => {
    router.push({
      pathname: `/board/report`,
      query: {
        reportTargetBoardId,
      },
    });
  };

  //로그인여부 본인게시글
  const userState = useSelector((state: RootState) => state.user.user);
  const [isUser, setIsUser] = useState(false);
  const cleanContent = DOMPurify.sanitize(post.content);

  //태그항목추가
  const [tag, setTag] = useState(post.tag);

  // 처음엔 모달이 닫혀있다가 누르면 버튼이 열리게 //
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClick = () => {
    setIsModalOpen(!isModalOpen);
  };
  let [like, setLike] = useState(0);
  let [count, setCount] = useState(0);

  const router = useRouter();

  // delete 요청 코드
  const onDelete = async () => {
    try {
      const response = await api.delete(`${serverUrl}/boards/${post.boardId}`);
      if (response.status === 200) {
        window.alert('게시글 삭제되었습니다.😎');
        router.push(`/board`);
      } else {
        router.push(`/board/${post.boardId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userState && post && userState.userId === post.userId) {
      setIsModalOpen(true);
      setIsUser(true);
    }
  }, [post, userState]);
  console.log('isUser : ', isUser);
  console.log('isModalOpen : ', isModalOpen);
  return (
    <>
      <div className="flex flex-col justify-between w-180 h-[100%] left-1/2 box-border">
        <div className="boardwrap">
          <div className="bg-pink-100 w-860 h-40 flex justify-center items-center p-10 text-3xl mt-20 font-bold border-4 border-red-100">
            통합 게시판
          </div>
          <div className="flex flex-row space-x-2 mt-3 mb-3">
            <button className="border-zinc-800 border-2 rounded px-4 py-2 bg-gray-100 hover:bg-gray-200">
              <Link href="/board/">목록</Link>
            </button>
            {!isUser ? (
              <div></div>
            ) : (
              <div className="space-x-2">
                <Link
                  href={{
                    pathname: '/board/edit',
                    query: {
                      detail: JSON.stringify(post),
                    },
                  }}
                  as="/board/edit"
                >
                  <button className="border-zinc-800 border-2 rounded px-4 py-2 bg-blue-100 hover:bg-blue-200">
                    수정
                  </button>
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('정말로 삭제하시겠습니까?')) {
                      onDelete();
                    }
                  }}
                  className="border-zinc-800 border-2 rounded px-4 py-2 bg-red-100 hover:bg-red-200"
                >
                  삭제
                </button>
                <button
                  onClick={handleReport}
                  className="border-zinc-800 border-2 rounded px-4 py-2 bg-green-100 hover:bg-green-200"
                >
                  신고
                </button>
              </div>
            )}
          </div>
          <div className="border-4 border-black">
            <div className="flex flex-row items-center justify-between h-16 p-4">
              <div className="flex flex-row p-2 space-x-3 ">
                <div className="font-bold text-2xl">{post && post.title}</div>
                <div className="text-slate-500">
                  {post && changeUtcTimeToKst(post.createdAt)}
                </div>
                <p className="text-lg">[{post.tag}]</p>
              </div>
            </div>
            <div className="border-t-2 text-lg border-black p-4">
              <div dangerouslySetInnerHTML={{ __html: cleanContent }}></div>
            </div>
          </div>
          <div className="flex flex-row space-x-2 mt-3 mb-3">
            <button className="border-zinc-800 border-2 rounded px-4 py-2 bg-gray-100 hover:bg-gray-200">
              <Link href="/board/">목록</Link>
            </button>
            {!isUser ? (
              <div></div>
            ) : (
              <div className="space-x-2">
                <Link
                  href={{
                    pathname: '/board/edit',
                    query: {
                      detail: JSON.stringify(post),
                    },
                  }}
                  as="/board/edit"
                >
                  <button className="border-zinc-800 border-2 rounded px-4 py-2 bg-blue-100 hover:bg-blue-200">
                    수정
                  </button>
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('정말로 삭제하시겠습니까?')) {
                      onDelete();
                    }
                  }}
                  className="border-zinc-800 border-2 rounded px-4 py-2 bg-red-100 hover:bg-red-200"
                >
                  삭제
                </button>
                <button
                  onClick={handleReport}
                  className="border-zinc-800 border-2 rounded px-4 py-2 bg-green-100 hover:bg-green-200"
                >
                  신고
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardCardDetail;
