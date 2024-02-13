import Link from 'next/link';
import ConversationBox from '@/src/components/common/ConversationBox';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import ChattingListBar from '@/src/components/features/layout/ChattingListBar';
import { useEffect, useState } from 'react';
import { ChatHistoryType, HistoryType } from '@/src/components/types/ChatTypes';
import { useRouter } from 'next/router';
import { useFirstLoginMessage } from '@/src/hooks/api/chat';
import Seo from '@/src/components/common/Seo';

const CounselingResult = () => {
  const [chatId, setChatId] = useState('')
  const [history, setHistory] = useState<HistoryType>([['',''],['','']])
  const userState = useSelector((state: RootState) => state.user.user)
  const router = useRouter()
  const makeChatLog = useFirstLoginMessage()

  useEffect(() => {
    const historyJSON = localStorage.getItem(`firstMessage`)
    console.log(historyJSON)
    if (historyJSON) {
      setChatId(JSON.parse(historyJSON)[0][0])
      setHistory(JSON.parse(historyJSON));
    } 
  }, [])

  const handleNavigate = (path: string) => {
    if (path === '/chat') {
      router.push(path)
    }
    else {
      if (userState.userId === '0' && window.confirm('로그인이 필요한 기능입니다. \n로그인 페이지로 이동하시겠습니까?')) {    
        router.push('/login');
      }
      else {
        if (path === `/chat${chatId}` && chatId === 'GUSET') {
          makeChatLog.mutateAsync({
            title: history[0][1],
            history: history[1]
          })
        }
        router.push(path)
      }
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <Seo title='답변' />
      <ChattingListBar />
      <div className="mt-20">
        <ConversationBox text={history[1][1]} isGuru={true}/>
      </div>

      <div className="flex flex-col gap-2 mt-10 mb-10">
        <button className="flex justify-center items-center w-42 h-8 border-2 border-white bg-white/70 rounded-md hover:bg-[#f02356] drop-shadow-lg" onClick={() => handleNavigate(`/chat/${chatId}`)}>
          추가 질문하기
        </button>
        <button className="flex justify-center items-center w-42 h-8 border-2 border-white bg-white/70 rounded-md hover:bg-[#f02356] drop-shadow-lg" onClick={() => handleNavigate(`/board/write`)}>
          제자들에게 질문하기
        </button>
        <button className="flex justify-center items-center w-42 h-8 border-2 border-white bg-white/70 rounded-md hover:bg-[#f02356] drop-shadow-lg" onClick={() => handleNavigate(`/chat`)}>
          새 질문하기
        </button>
      </div>
      <img src="/images/guru.png" alt='guru' className="h-[300px] mt-20 fixed bottom-[50px]"></img>
    </div>
  );
};

export default CounselingResult;
