import ConversationBox from '@/src/components/common/ConversationBox';
import { useEffect, useState } from 'react';
import AnswerLoadingPage from '../../components/features/chat/AnswerLoading';
import { useDispatch, useSelector } from 'react-redux';
import { saveResult } from '@/src/store/chat';
import { useRouter } from 'next/router';
import { scriptForInput } from '@/src/utils/const/scripts';
import ChattingListBar from '@/src/components/features/layout/ChattingListBar';
import { useFirstGuestMessage, useFirstLoginMessage } from '@/src/hooks/api/chat';
import { RootState } from '@/src/store';
import Seo from '@/src/components/common/Seo';

const gurusMessage =
  '그렇구만.. 대강 감이 오는구만. 어디 한 번 상세하게 고민을 읊어보게나.';

const AIcounselingPage = () => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('')
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user.user)
  const router = useRouter();

  const sendGuestMessage = useFirstGuestMessage();
  const sendLoginMessage = useFirstLoginMessage();

  useEffect(() => {
    const testJSON = localStorage.getItem(`testResult`)
    console.log('테스트 결과: ',testJSON)
    if (testJSON) {
      setTestResult(testJSON);
      localStorage.removeItem('testResult')
    } 
  }, [])

  const handleMessage = async () => {
    console.log('userId: ', userState.logintype)
    if (testResult) {
      if (userState.userId === '0') {
        sendGuestMessage.mutateAsync({
          question: userInput,
          testResult: { classification: '연애', situation: [testResult] }
        })
      }
      else {
        sendLoginMessage.mutateAsync({
          question: userInput,
          testResult: { classification: '연애', situation: [testResult] }
        })
      }
    }
    else {
      if (userState.logintype === '0') {
        sendGuestMessage.mutateAsync({
          question: userInput,
        })
      }
      else {
        sendLoginMessage.mutateAsync({
          question: userInput,
        })
      }
    }
    setUserInput('')
  }

  useEffect(() => {
    if (sendGuestMessage.isPending) {
      setLoading(true)
    }
  
    if (sendGuestMessage.data) {
      setLoading(false)
      localStorage.setItem('firstMessage', JSON.stringify(sendGuestMessage.data.data))
      router.push('/chat/result')
    }
  
    if (sendGuestMessage.error) {
      console.error('api 호출 오류', sendGuestMessage.error);
      setLoading(false)
    }

    if (sendLoginMessage.isPending) {
      setLoading(true)
    }
  
    if (sendLoginMessage.data) {
      setLoading(false)
      console.log(sendLoginMessage.data.data)
      localStorage.setItem('firstMessage', JSON.stringify(sendLoginMessage.data.data))
      router.push('/chat/result')
    }
  
    if (sendLoginMessage.error) {
      console.error('api 호출 오류', sendLoginMessage.error);
      setLoading(false)
    }
  }, [sendGuestMessage, sendLoginMessage])

  return (
    <div >
      <Seo title='질문 입력' />
      <ChattingListBar />
      {loading? (
        <AnswerLoadingPage/>
        ):(
        <div className="flex flex-col items-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
          <div className="mt-20">
            <ConversationBox text={scriptForInput.text} isGuru={scriptForInput.isGuru} />
          </div>
          <img src="/images/guru.png" alt='guru' className="h-[300px] mt-20"></img>
          <div className="flex flex-row gap-1 mt-10 form fixed bottom-[50px]">
            <textarea
              className="border-2 border-[#0c0b0b] rounded-md min-w-[500px] min-h-[70px] bg-white/70"
              placeholder="고민을 입력하세요."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
            />

            <div className="flex flex-col gap-1 justify-center">
              {/* <label htmlFor='file-upload' className='border-2 border-[#0c0b0b] bg-white rounded-md flex justify-center'> 📎 </label>
              <input id="file-upload" className='hidden' type="file" accept="image/*" placeholder="📎" /> */}
              <button
                onClick={handleMessage}
                className="max-w-10 border-2 border-[#0c0b0b] bg-white rounded-md"
              >
                🔺
              </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
};

export default AIcounselingPage;