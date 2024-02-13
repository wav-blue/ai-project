import { ChatResponseType, SendingMessageType } from "@/src/components/types/ChatTypes";
import { useBaseMutation, useBaseQuery } from "./reactQueryConfig";
import { LoginRequestType, RegisterRequestType } from "@/src/components/types/UserTypes";
import { useState } from "react";

export const useValidation = () => {
  const [trigger, setTrigger] = useState(false);
  const { isLoading, error, data } = useBaseQuery(`/user/me`, 'validation', trigger)

  const executeQuery = () => {
    setTrigger(true);
  }

  return {
    isLoading,
    error,
    data,
    executeQuery,
  }
}

export const useRegister = () => {
  return useBaseMutation('/user/register', 'post')
}

export const useEmailLogin = () => {
  return useBaseMutation('/user/login/email', 'post')
}

export const useEditUser = () => {
  return useBaseMutation('/user/edit', 'put')
}

export const useLogout = () => {
  const [trigger, setTrigger] = useState(false);
  const { isLoading, error, data } = useBaseQuery('/user/logout', 'logout', trigger)

  const executeQuery = () => {
    setTrigger(true);
  }

  return {
    isLoading,
    error,
    data,
    executeQuery,
  }
}

export const useUserBoadrd = (query: string) => {
  
  return useBaseQuery(`/boards/my${query}`, 'userboard')
}

export const useUserComment = (query: string) => {

  return useBaseQuery(`/comments/my${query}`, 'userComment')
}

export const useMemberShip = () => {
  return useBaseQuery('/user/my/membership', 'membership')
}

export const useUserResign = () => {
  return useBaseMutation('/user/resign', 'post')
}