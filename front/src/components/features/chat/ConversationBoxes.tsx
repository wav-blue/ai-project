import { useEffect, useState } from "react";
import ConversationBox from "../../common/ConversationBox";
import { ChatHistoryType, ChatLogType, ChatResponseType } from "../../types/ChatTypes";

const ConversationBoxes = ({ cursor, history } : ChatLogType) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedChats, setDisplayedChats] = useState<ChatHistoryType>([]);

  useEffect(() => {
    if(history && currentIdx < history.length) {
      const timer = setTimeout(() => {
        setDisplayedChats(prev => { 
          const newChats = [...prev]
          newChats.push(history[currentIdx])
          return newChats
        });
        console.log(displayedChats)
        setCurrentIdx(idx => idx + 1);
      }, 1000)

      return () => clearTimeout(timer);
    }
  }, [currentIdx, history])

  if(!history) {
    return (
      <div>
        <ConversationBox text={'대화 내역이 없다네..'} isGuru={true}/>
      </div>
    )
  }

  return (
    <div>
      {displayedChats.map((chat, idx) => (
        idx % 2 === 0 ? (
          // 짝수번 인덱스일 때
          <div key={idx} className="my-5 flex-1 justify-start">
            <ConversationBox text={chat} isGuru={false} key={chat.length} />
          </div>
        ) : (
          // 홀수번 인덱스일 때
          <div key={idx} className="my-5 flex-1 justify-end">
            <ConversationBox text={chat} isGuru={true} key={chat.length}/>
          </div>
        )
      ))}
    </div>
  )
}

export default ConversationBoxes;