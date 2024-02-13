import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ChatLogType, ImageLogType } from '../dtos/chat.dto';
import * as dayjs from 'dayjs';
import {
  ChatCompletion,
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  CompletionUsage,
} from 'openai/resources';
import { ChatLog } from '../schemas/chatlog.schema';
import { Chat } from '../schemas/chat.schema';
import { FreeChatLog } from '../schemas/freechatLog.schema';
import { ChatDialogue } from '../schemas/chatDialogue.schema';

@Injectable()
export class ChatDataManageService {
  //첫질문 답변 가공
  format1stCompletion(
    userId: string,
    question: string,
    prompt: ChatCompletionMessageParam[],
    response: ChatCompletion,
    imageOCR?: null | { text: string; log: ImageLogType },
  ): {
    chatDoc: Chat;
    chatLogDoc: ChatLog;
    chatDialogueDoc: ChatDialogue;
    title: string;
    answer: string;
  } {
    try {
      const { id, created, usage, system_fingerprint, choices } = response;
      const resOBJ = JSON.parse(choices[0].message.content); //구루 답변: json string parsing
      const { title, answer } = resOBJ; //고민주제와 답변 분리

      //다이알로그 가공
      const dialogue = [...prompt];
      const newQuestion = { ...dialogue.pop() };
      newQuestion.content = question; //유저 프롬프트에 추가했던 시스템 지시사항 삭제, 질문만 남기고 다시 끼움
      dialogue.push(newQuestion);

      const newAnswer: ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: answer,
        name: 'Guru',
      };
      dialogue.push(newAnswer); //구루 응답에서 타이틀 부분 제거한 답변만 밀어넣음.

      const logMessage = [...prompt]; //로그용 질문 형식 지시도 남김
      logMessage.push(choices[0].message);

      const chatDoc = {
        userId: userId,

        title: title,
        dialogue: dialogue, //클라이언트 표시, GPT에게 전달할 대화맥락(가공됨)
        nextPromptToken: usage.total_tokens,
        tokenUsageRecords: usage.total_tokens,
      };

      const chatLogDoc = {
        chatId: '',
        userId: userId,
        log: [
          {
            completionId: id,
            token: usage,
            fingerPrint: system_fingerprint,
            date: dayjs.unix(created).toDate(),
            message: logMessage, //로그는 Raw 형태로 저장, obj[]
          },
        ],
        imageLog: [],
      };

      if (imageOCR) {
        chatLogDoc.imageLog.push(imageOCR.log); //이미지 로그 있을경우 챗로그에 밀어넣음
      }

      const chatDialogueDoc = {
        chatId: '',
        userId: userId,
        dialogue: dialogue.slice(2).map((log) => log.content),
      };

      return { chatDoc, chatLogDoc, chatDialogueDoc, title, answer };
    } catch (err) {
      throw new ServiceUnavailableException('로그 문서 생성 실패');
    }
  }

  formatContinueCompletion(
    question: string,
    prompt: ChatCompletionMessageParam[],
    response: ChatCompletion,
    history: Chat,
  ): { chatDoc: Chat; chatLog: ChatLogType; answer: string } {
    try {
      const { id, created, usage, system_fingerprint, choices } = response;
      const resOBJ = JSON.parse(choices[0].message.content); //구루 답변: json string parsing
      const { title, answer } = resOBJ; //고민주제와 답변 분리

      const newQuestion = { ...[...prompt].pop() };
      newQuestion.content = question; //유저 프롬프트에 추가했던 시스템 지시사항 삭제, 질문만 남겨서 다시 넣음
      history.dialogue.push(newQuestion);
      const newAnswer: ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: answer,
        name: 'Guru',
      };
      history.dialogue.push(newAnswer); //구루 응답에서 답변만 밀어넣음
      history.nextPromptToken = usage.total_tokens;
      history.tokenUsageRecords += usage.total_tokens;

      history.title ||= title; //title 바꾸는 시점이면(새 title 받았으면) title 변경

      const logMessage = [...prompt];
      logMessage.push(choices[0].message); //DB 로그메시지용 Raw 다이알로그

      const log = {
        completionId: id,
        token: usage,
        fingerPrint: system_fingerprint,
        date: dayjs.unix(created).toDate(),
        message: logMessage, //로그는 Raw 형태로 저장, obj[]
      };

      return {
        chatDoc: history,
        chatLog: log,
        answer: answer,
      };
    } catch (err) {
      throw new ServiceUnavailableException('로그 문서 생성 실패');
    }
  }

  formatFreeCompletion(
    prompt: ChatCompletionMessageParam[],
    response: ChatCompletion,
    imageOCR?: null | { text: string; log: ImageLogType },
  ): { freeChatLogDoc: FreeChatLog; title: string; answer: string } {
    try {
      const { id, created, usage, system_fingerprint, choices } = response;
      const resOBJ = JSON.parse(choices[0].message.content); //구루 답변: json string parsing
      const { title, answer } = resOBJ; //답변 텍스트 추출

      //로그용 다이알로그에 답변 끼우기
      const logMessage = [...prompt];
      logMessage.push(choices[0].message);

      const freeChatLogDoc = {
        log: [
          {
            completionId: id,
            token: usage,
            fingerPrint: system_fingerprint,
            date: dayjs.unix(created).toDate(),
            message: logMessage, //로그는 Raw 형태로 저장, obj[]
          },
        ],
        imageLog: [],
      };

      if (imageOCR) {
        freeChatLogDoc.imageLog.push(imageOCR.log); //이미지 로그 있을경우 챗로그에 밀어넣음
      }

      return { freeChatLogDoc, title, answer };
    } catch (err) {
      throw new ServiceUnavailableException('로그 문서 생성 실패');
    }
  }

  freeChatForSaving(
    userId: string,
    title: string,
    history: string[],
    prompt: ChatCompletionMessageParam[],
  ): { chatDoc: Chat; chatLogDoc: ChatLog; chatDialogueDoc: ChatDialogue } {
    try {
      const dialogue = [...prompt];
      dialogue[2].content = history[0];
      dialogue[3].content = history[1];

      const tokenLog: CompletionUsage = {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0,
      };
      const chatDoc = {
        userId: userId,
        title: title,
        dialogue: dialogue, //클라이언트 표시, GPT에게 전달할 대화맥락
        nextPromptToken: 0,
        tokenUsageRecords: 0,
      };

      const chatLogDoc = {
        chatId: '',
        userId: userId,
        log: [
          {
            guest: true,
            completionId: 'GUEST-FREE-CHAT',
            token: tokenLog,
            fingerPrint: 'GUEST-FREE-CHAT',
            message: prompt,
          },
        ],
        imageLog: [],
      };

      const chatDialogueDoc = {
        chatId: '',
        userId: userId,
        dialogue: history,
      };

      return { chatDoc, chatLogDoc, chatDialogueDoc };
    } catch (err) {
      throw new ServiceUnavailableException('로그 문서 생성 실패');
    }
  }
}
