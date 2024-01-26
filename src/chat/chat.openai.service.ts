import * as dayjs from 'dayjs';
import { openai } from 'src/configs/openai.config';
import { Injectable } from '@nestjs/common';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import { Return1stCompletionDTO } from './chat.dto';

@Injectable()
export class ChatOpenAi {
  //open ai API 에 채팅 날리는 메소드
  private async getCompletion(
    prompt: ChatCompletionMessageParam[],
  ): Promise<ChatCompletion> {
    try {
      console.log('질문시작');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: prompt,
      });
      return response;
    } catch (err) {
      throw err;
    }
  }

  //첫질문 답변 가공
  async get1stCompletion(
    prompt: ChatCompletionMessageParam[],
  ): Promise<Return1stCompletionDTO> {
    try {
      const response = await this.getCompletion(prompt);
      const { id, created, usage, system_fingerprint, choices } = response;
      const resOBJ = JSON.parse(choices[0].message.content); //구루 답변: json string parsing
      const { title, answer } = resOBJ; //고민주제와 답변 분리
      const logMessage = [...prompt];
      logMessage.push(choices[0].message);
      console.log('log prompt: ', logMessage);

      return {
        title: title,
        answer: { role: 'assistant', content: answer, name: 'Guru' },
        nextPromptToken: usage.total_tokens,
        log: {
          no: 1,
          completionId: id,
          token: usage,
          fingerPrint: system_fingerprint,
          date: dayjs.unix(created),
          message: logMessage, //로그는 Raw 형태로 저장
        },
        tokenUsageRecords: usage.total_tokens,
      };
    } catch (err) {
      throw err;
    }
  }
}
