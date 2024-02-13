import Link from 'next/link';
import ConversationBox from '../components/common/ConversationBox';
import { scriptForMain } from '../utils/const/scripts';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useEffect, useState } from 'react';
import { useFirstLoginMessage } from '@/src/hooks/api/chat';
import { ChatHistoryType, HistoryType } from '@/src/components/types/ChatTypes';
import withAuth from '../hocs/withAuth';

const HomePage = () => {
  const userState = useSelector((state: RootState) => state.user.user);
  const [chatId, setChatId] = useState('')
  const [history, setHistory] = useState<HistoryType>([['',''],['','']])
  const makeChatLog = useFirstLoginMessage()

  useEffect(() => {
    if(userState.userId !== '0') {
      const historyJSON = localStorage.getItem(`firstMessage`)
      if (historyJSON) {
        setHistory(JSON.parse(historyJSON));
        setChatId(JSON.parse(historyJSON)[0][0])
      } 
    } 
  }, [])

  useEffect(() => {
    if (chatId === 'GUEST' && userState.userId !== '0') {
      makeChatLog.mutateAsync({
        title: history[0][1],
        history: history[1]
      })
    }
  }, [chatId, history])


  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <img src="/images/title.png" className="title-resizing mt-4"></img>
      <img src="/images/guru.png" className="quarter-size mt-4"></img>

      <div>
        <ConversationBox
          text={scriptForMain.text}
          isGuru={scriptForMain.isGuru}
        />
      </div>

      <div className="flex flex-row gap-20 mt-10">
        <Link href="/chat">
          <div className="flex justify-center items-center w-42 h-8 border-2 border-white bg-[#eb1818]/70 rounded-md hover:bg-[#f80808] drop-shadow-lg">
            👉구루에게 상담받기
          </div>
        </Link>
      </div>

      <div className="flex flex-row gap-20 mt-10 mb-12">
        <Link href="/login">
          <div className="w-30 h-6 border-2 border-white bg-white/70 rounded-md hover:bg-[#f7f6f6] drop-shadow-lg">
            SNS 간편로그인
          </div>
        </Link>
        <Link href="/board">
          <div className="w-30 h-6 border-2 border-white bg-white/70 rounded-md hover:bg-[#f7f6f6] drop-shadow-lg">
            구루의 제자들
          </div>
        </Link>
      </div>
      <Link href="/payment">
          <div className="w-30 h-6 border-2 border-white bg-[#e0c83d] rounded-md hover:bg-[#fcd704] drop-shadow-lg mb-[5vh]">
            About Membership
          </div>
        </Link>
    </div>
  );
};

export default withAuth(HomePage);
