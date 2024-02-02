import { openai } from 'src/configs/openai.config';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
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
        model: 'gpt-3.5-turbo-0125',
        temperature: 0.75,
        max_tokens: 500,
        top_p: 0.98,
        frequency_penalty: 0.2,
        presence_penalty: 0.4,
        response_format: { type: 'json_object' },
        messages: prompt,
      });
      return response;
    } catch (err) {
      throw new ServiceUnavailableException('open ai에 연결할 수 없습니다.');
    }
  }
}
