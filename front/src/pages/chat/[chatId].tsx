import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { useRouter } from 'next/router';
import ConversationBoxes from '@/src/components/features/chat/ConversationBoxes';
import { ChatHistoryType } from '@/src/components/types/ChatTypes';
import { useEffect, useState } from 'react';
import ChattingListBar from '@/src/components/features/layout/ChattingListBar';
import AdditionalLoading from '@/src/components/features/chat/AdditionalAnswerLoading';
import withAuth from '@/src/hocs/withAuth';

const ExtraChatPage = () => {
  // const history = useSelector((state: RootState) => state.chat.response)
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter()
  const chatId = router.query.chatId
  const [history, setHistory] = useState<ChatHistoryType>(['',''])
  const [cursor, setCursor] = useState(0);
  const [query, setQuery] = useState(`${chatId}?${cursor}`);
  const getLog = useChatLog(query);
  const additionalMessage = useAdditionalMessage(chatId, query);

  useEffect(() => {
    // chatId 변경 시 로직 수행
    if (router.query.chatId) {
      const newChatId = router.query.chatId;
      setHistory(['',''])
      setCursor(0);
      setQuery(`${newChatId}?0`);
    }
  }, [router.query.chatId]);

  // get 요청의 내용을 통해서 data(history)와 cusor(서버에서 받은 커서값)를 업데이트 하는 부분
  useEffect(() => {
    if(getLog.data) {
      setHistory(getLog.data?.data.history)
      setCursor(getLog.data?.data.cursor)
    }
  }, [getLog])

  // 새로운 메세지를 보내는 부분
  const handleMessage = async () => {
    additionalMessage.mutateAsync({
      question: userInput,
    })
    setUserInput('')

    if (additionalMessage.isPending) {
      setLoading(true);
      setHistory((prev) => {
        const newHistory = prev
        newHistory.push(`${userInput}`, ' 음... 잠시 생각을 정리하는 중이라네...........................................................................................................................................................................................................................')
        return newHistory
      })
    }

    if (additionalMessage.data) {
      setLoading(false);
    }
    
    if (additionalMessage.error) {
      setLoading(false);   
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <ChattingListBar />
      <div className='mx-[20vh] flex flex-col items-center'>
      
      {/* get요청으로 받은 데이터를 출력하는 부분. 영역이 제한되어있고, 여기의 스크롤을 감지해야 한다. */}
        <div className="mt-20 max-h-[70vh] overflow-y-auto">
          <ConversationBoxes history={history} cursor={cursor} key={`chatId:${chatId}`}/>
        </div>


        <div className='flex flex-row fixed bottom-[50px] form'>
          {loading ? (<AdditionalLoading/>) : (<img src="/images/guru.png" alt='guru' className="h-[15vh]" />)
          }
               
          <textarea
            className="border-2 border-[#0c0b0b] rounded-md w-[50vw] max-w-[700px] min-h-[70px] bg-white/70"
            placeholder="고민을 입력하세요."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
          />

          <div className="flex flex-col gap-1 justify-center">
            <button
              onClick={handleMessage}
              className="max-w-10 border-2 border-[#0c0b0b] bg-white rounded-md"
            >
              🔺
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ExtraChatPage);

import * as Api from '../../utils/api'
import { GetServerSidePropsContext } from 'next';
import { useAdditionalMessage, useChatLog } from '@/src/hooks/api/chat';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookie = context.req.headers.cookie || '';

  try {
    const res = await Api.get('/user/me', undefined, cookie)
    if (res.data) {
      return { props: {} };
    }
  } catch(err) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}