import { useEffect, useState } from 'react';
import { ConversationBoxType } from '../types/ChatTypes';

const ConversationBox = ({ text, isGuru }: ConversationBoxType) => {
  const [typedText, setTypedText] = useState('');
  const [index, setIndex] = useState(0);
  const typingDelay = 40;
  let person = '';
  if (isGuru) person = 'AI 구루';
  else person = '당신';

  useEffect(() => {
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText(prev => prev + text[index]);
        setIndex(index + 1);
      }
      if (index === text.length) {
        clearInterval(timer);
      }
    }, typingDelay);

    return () => clearInterval(timer);
  }, [index, text]);

  return (
    <div className="max-w-3/4">
      <div>
        {person === 'AI 구루' &&
        <div className="mb-5 flex mx-2">
          <div className="w-20 h-8 border-2 border-white flex justify-center items-center bg-white/70 rounded-md drop-shadow-md">
            {person}
          </div>
        </div>
        }
        {person === '당신' &&
        <div className="mb-5 flex justify-end mx-2">
          <div className="w-20 h-8 border-2 border-white flex justify-center items-center bg-[#df8181]/60 rounded-md drop-shadow-md">
            {person}
          </div>
        </div>
        }

        <div>
          {person === 'AI 구루' &&
            <div className="w-[600px] min-h-16 border-2 border-white flex justify-center items-center bg-white/70 break-words rounded-md drop-shadow-md">
              {typedText}
            </div>
          }
          {person === '당신' &&
            <div className="w-[600px] min-w-[300px] min-h-16 border-2 border-white flex justify-center items-center bg-[#df8181]/60 break-words rounded-md drop-shadow-md">
              {typedText}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
