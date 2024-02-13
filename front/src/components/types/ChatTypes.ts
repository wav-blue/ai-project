// 상황문답 결과 타입
export interface TestResultType {
  classification?: string;
  situation: string;
}

// Gpt로 Post요청 시 req.body에 넣을 데이터 타입
export interface SendingMessageType {
  question: string;
  testResult?: TestResultType;
  imageUrl?: string;
}

type ChatInfoType = [string, string];
export type ChatHistoryType = string[];
export type HistoryType = [ChatInfoType, ChatHistoryType]

// Gpt로 Post요청 시 res.body에 담길 데이터 타입
export interface ChatResponseType {
  response: HistoryType
}

export interface ChatListDataType {
  chatId: string;
  title: string;
}

export type ChatListType = ChatListDataType[]

export interface ChatLogType {
  cursor: number;
  history: ChatHistoryType;
}

// 추가질문 시 req.body에 넣을 데이터 타입
export interface AdditionalMessageType {
  question: string;
  history: HistoryType;
  imageUrl?: string;
}

export interface ConversationBoxType {
  text: string;
  isGuru?: boolean;
}

export interface ConversationBoxesType {
  chatData: HistoryType;
}

export interface SurveyAnswerType {
  answer: string;
  add: string;
}

export interface SurveyQuestionType {
  question: string;
  options: SurveyAnswerType[]
}

