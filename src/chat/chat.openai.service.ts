import { openai } from 'src/configs/openai.config';
import { Injectable } from '@nestjs/common';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class ChatOpenAi {
  //open ai API 에 채팅 날리는 메소드
  async getCompletion(
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
}
