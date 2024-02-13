import { useEffect, useState } from "react";
import { ChatListType, HistoryType } from "../../types/ChatTypes";
import Link from "next/link";
import { useChatList } from "@/src/hooks/api/chat";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import withAuth from "@/src/hocs/withAuth";
import { useRouter } from "next/router";

const ChattingListBar = () => {
  const [chatList, setChatList] = useState<ChatListType>([]);
  const [isOpen, setIsOpen] = useState(false)
  const getChatList = useChatList();
  const userState = useSelector((state: RootState) => state.user.user);
  const router = useRouter()

  useEffect(() => {
    if (getChatList.data) {
      setChatList(getChatList.data.data)
    }
  }, [getChatList])

  const handleList = () => {
    getChatList.executeQuery();
    if (userState.userId !== '0') {
      setIsOpen(!isOpen)
    }
  }

  const handleLock = () => {
    alert('로그인이 필요한 기능입니다.')
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div>
      {userState.userId == '0' &&
        (
          <button 
            className="fixed top-[2vh] left-[2vh] w-[7vh] h-[7vh] bg-[#ff607e] hover:bg-[#f33c5e] rounded-full border-2 border-red-700 flex flex-col justify-center items-center drop-shadow-2xl" 
            onClick={handleLock}>
            <div className="absolute -top-[15px] flex justify-center items-center w-full">
              <img
                src="/images/lock.png"
                className="rounded-full h-[30px] w-[30px]"
              />
            </div>
            Chat History
          </button>
        )
      }
      {(!isOpen && userState.userId !== '0') && (
          <button className="fixed top-[2vh] left-[2vh] w-[7vh] h-[7vh] bg-[#ff607e] hover:bg-[#f33c5e] rounded-full border-2 border-red-700 flex justify-center items-center drop-shadow-2xl" onClick={handleList}>
          Chat History
          </button>
        )}  
        { isOpen && userState.userId !== '0' &&
        (
          <div className="fixed top-[1vh] left-[1vh] w-[18vh] h-[70%] bg-[#ff607e] flex flex-col gap-5 rounded-lg border-4 border-white/70 overflow-y-auto drop-shadow-2xl" onClick={() => setIsOpen(!isOpen)}>
            
            <div className="flex justify-center mt-2 text-[#f0e9e9]">
              Chat History
            </div>

            <div className="flex flex-col ml-5 gap-3">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                    <img
                      src="/images/guru.png"
                      className="rounded-full h-[33px] w-[36px]"
                    ></img>
                    홈
                </Link> 
              </div>
              <div className="flex items-center gap-2">
                <Link href="/chat" className="flex items-center">
                  <img
                    src="/images/writing.png"
                    className="rounded-full h-[27px] w-[25px]"
                  ></img>
                  새질문
                </Link>
              </div>
            </div> 

            {chatList && chatList.map((chatInfo, idx) => (
              <div 
              key={idx} 
              className="p-1 my-1 mx-1 border-2 border-white/70 rounded-lg bg-[#f34363] hover:bg-[#e9b7bf]"
              >
                <button onClick={() => handleNavigate(`/chat/${chatInfo.chatId}`)}>
                  {chatInfo.title}
                </button>
              </div>
            ))
            }
          </div>
          )
        } 

    </div>
  );
};

export default withAuth(ChattingListBar);
