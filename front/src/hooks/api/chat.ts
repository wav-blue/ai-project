import { ChatResponseType, SendingMessageType } from "@/src/components/types/ChatTypes";
import { useBaseMutation, useBaseQuery } from "./reactQueryConfig";
import axios from "axios";
import * as Api from '../../utils/api'
import { useEffect, useState } from "react";

export const useFirstLoginMessage = () => {
  return useBaseMutation('/chat', 'post')
}

export const useFirstGuestMessage = () => {
  return useBaseMutation('/chat/free', 'post')
}

export const useChatList = () => {
  const [trigger, setTrigger] = useState(false);
  const { isLoading, error, data } = useBaseQuery(
    `/chat`,
    'chattingList',
    trigger,
  );

  const executeQuery = () => {
    setTrigger(true);
  };

  return {
    isLoading,
    error,
    data,
    executeQuery,
  };
};

// export const useChatLog = () => {
//   const [query, setQuery] = useState('');
//   const [trigger, setTrigger] = useState(false);

//   const executeQuery = (newQuery: string) => {
//     setQuery(newQuery);
//     setTrigger(prev => !prev);
//   };

//   const { isLoading, error, data } = useBaseQuery(
//     `/chat/${query}`,
//     `chatLog${query}`, 
//     trigger, 
//   );

//   return {
//     isLoading,
//     error,
//     data,
//     executeQuery,
//   };
// };

export const useChatLog = (query: string) => {

 return useBaseQuery(`/chat/${query}`, `chatLog${query}`)
};

// `chatLog${query}`

export const useAdditionalMessage = ( chatId: string | string[] | undefined, query?: string | string[] | undefined, ) => {
  return useBaseMutation(`/chat/${chatId}`, 'post', `chatLog${query}`)
}

export const useTemporaryChatLog = async (query: string) => {
  try {
    const res = await Api.get(`/chat/${query}`)
  } catch (err) {

  }
}